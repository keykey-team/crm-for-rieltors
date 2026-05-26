import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../common/infrastructure/db/prisma";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import {
  generatePresignedUploadUrl,
  getFileUrl,
} from "../../common/infrastructure/storage/s3";

const router = Router();

function withAsyncGuard(handler: any): any {
  if (Array.isArray(handler)) return handler.map(withAsyncGuard);
  if (typeof handler !== "function" || handler.length === 4) return handler;
  return (req: any, res: any, next: any) => {
    try {
      const out = handler(req, res, next);
      if (out && typeof out.then === "function") out.catch(next);
    } catch (err) {
      next(err);
    }
  };
}

(["get", "post", "put", "delete", "patch"] as const).forEach((method) => {
  const original = (router as any)[method].bind(router);
  (router as any)[method] = (path: any, ...handlers: any[]) =>
    original(path, ...handlers.map(withAsyncGuard));
});

router.use(authMiddleware);

const isAdmin = (role?: string) => role === "admin" || role === "director";

router.get("/users", async (_req, res) => {
  res.json(
    await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        permissions: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  );
});
router.post("/users", async (req, res) => {
  if (!isAdmin(req.user?.role))
    return res.status(403).json({ error: "Forbidden" });
  const b = req.body ?? {};
  const user = await prisma.user.create({
    data: {
      name: b.name,
      email: b.email,
      password: await bcrypt.hash(String(b.password ?? ""), 12),
      role: b.role ?? "agent",
      phone: b.phone ?? null,
      permissions: b.permissions ?? null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      permissions: true,
      createdAt: true,
    },
  });
  res.status(201).json(user);
});
router.put("/users/:id", async (req, res) => {
  if (!isAdmin(req.user?.role))
    return res.status(403).json({ error: "Forbidden" });
  const b = req.body ?? {};
  res.json(
    await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(b.name !== undefined ? { name: b.name } : {}),
        ...(b.role !== undefined ? { role: b.role } : {}),
        ...(b.phone !== undefined ? { phone: b.phone } : {}),
        ...(b.permissions !== undefined ? { permissions: b.permissions } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        permissions: true,
        createdAt: true,
      },
    }),
  );
});
router.delete("/users/:id", async (req, res) => {
  if (!isAdmin(req.user?.role))
    return res.status(403).json({ error: "Forbidden" });
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

router.get("/settings/profile", async (req, res) => {
  res.json(
    await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    }),
  );
});
router.put("/settings/profile", async (req, res) => {
  const b = req.body ?? {};
  const data: any = {};
  if (b.name !== undefined) data.name = b.name;
  if (b.phone !== undefined) data.phone = b.phone;
  if (b.avatar !== undefined) data.avatar = b.avatar;
  if (b.newPassword && String(b.newPassword).length >= 6)
    data.password = await bcrypt.hash(String(b.newPassword), 12);
  res.json(
    await prisma.user.update({
      where: { id: req.user!.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    }),
  );
});

router.get("/funnel-stages", async (_req, res) =>
  res.json(
    await prisma.funnelStage.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
  ),
);
router.post("/funnel-stages", async (req, res) => {
  const maxOrder = await prisma.funnelStage.aggregate({
    _max: { order: true },
  });
  res
    .status(201)
    .json(
      await prisma.funnelStage.create({
        data: { ...(req.body ?? {}), order: (maxOrder._max.order ?? -1) + 1 },
      }),
    );
});
router.put("/funnel-stages", async (req, res) => {
  const b = req.body ?? {};
  if (Array.isArray(b.stages)) {
    await prisma.$transaction(
      b.stages.map((s: any) =>
        prisma.funnelStage.update({
          where: { id: s.id },
          data: { order: s.order },
        }),
      ),
    );
    return res.json({ ok: true });
  }
  const { id, ...data } = b;
  res.json(await prisma.funnelStage.update({ where: { id }, data }));
});
router.delete("/funnel-stages", async (req, res) => {
  const id = String(req.query.id ?? "");
  if (!id) return res.status(400).json({ error: "id required" });
  const s = await prisma.funnelStage.findUnique({ where: { id } });
  if (!s) return res.status(404).json({ error: "Not found" });
  if (["new_lead", "closed", "cancelled", "rejected"].includes(s.value))
    return res.status(403).json({ error: "Cannot delete system stage" });
  await prisma.funnelStage.update({ where: { id }, data: { isActive: false } });
  res.json({ ok: true });
});

router.get("/deal-custom-fields", async (_req, res) =>
  res.json(
    await prisma.dealCustomField.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
  ),
);
router.post("/deal-custom-fields", async (req, res) =>
  res
    .status(201)
    .json(await prisma.dealCustomField.create({ data: req.body ?? {} })),
);
router.put("/deal-custom-fields", async (req, res) => {
  const b = req.body ?? {};
  if (Array.isArray(b.items)) {
    await prisma.$transaction(
      b.items.map((i: any) =>
        prisma.dealCustomField.update({
          where: { id: i.id },
          data: { order: i.order },
        }),
      ),
    );
    return res.json({ ok: true });
  }
  const { id, ...data } = b;
  res.json(await prisma.dealCustomField.update({ where: { id }, data }));
});
router.delete("/deal-custom-fields", async (req, res) => {
  const id = String(req.query.id ?? "");
  if (!id) return res.status(400).json({ error: "id required" });
  await prisma.dealCustomField.update({
    where: { id },
    data: { isActive: false },
  });
  res.json({ ok: true });
});

router.get("/dictionaries", async (req, res) => {
  const category =
    typeof req.query.category === "string" ? req.query.category : undefined;
  const where: any = { isActive: true };
  if (category) where.category = category;
  res.json(
    await prisma.dictionary.findMany({
      where,
      orderBy: [{ category: "asc" }, { order: "asc" }],
    }),
  );
});
router.post("/dictionaries", async (req, res) =>
  res
    .status(201)
    .json(await prisma.dictionary.create({ data: req.body ?? {} })),
);
router.put("/dictionaries", async (req, res) => {
  const b = req.body ?? {};
  if (Array.isArray(b.items)) {
    await prisma.$transaction(
      b.items.map((i: any) =>
        prisma.dictionary.update({
          where: { id: i.id },
          data: { order: i.order },
        }),
      ),
    );
    return res.json({ ok: true });
  }
  const { id, ...data } = b;
  res.json(await prisma.dictionary.update({ where: { id }, data }));
});
router.delete("/dictionaries", async (req, res) => {
  const id = String(req.query.id ?? "");
  if (!id) return res.status(400).json({ error: "id required" });
  await prisma.dictionary.update({ where: { id }, data: { isActive: false } });
  res.json({ ok: true });
});

router.get("/activity-log", async (req, res) => {
  const entityType =
    typeof req.query.entityType === "string" ? req.query.entityType : "";
  const entityId =
    typeof req.query.entityId === "string" ? req.query.entityId : "";
  const where: any = {};
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  res.json(
    await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  );
});
router.get("/templates", async (req, res) => {
  const type = typeof req.query.type === "string" ? req.query.type : "";
  const where: any = {};
  if (type) where.type = type;
  res.json(
    await prisma.template.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { id: true, name: true } } },
    }),
  );
});
router.post("/templates", async (req, res) => {
  const b = req.body ?? {};
  res
    .status(201)
    .json(
      await prisma.template.create({
        data: {
          name: b.name,
          type: b.type ?? "message",
          category: b.category ?? "general",
          content: b.content,
          variables: b.variables ?? null,
          createdById: req.user?.id ?? null,
        },
      }),
    );
});
router.put("/templates/:id", async (req, res) => {
  const b = req.body ?? {};
  res.json(
    await prisma.template.update({
      where: { id: req.params.id },
      data: {
        ...(b.name !== undefined ? { name: b.name } : {}),
        ...(b.type !== undefined ? { type: b.type } : {}),
        ...(b.category !== undefined ? { category: b.category } : {}),
        ...(b.content !== undefined ? { content: b.content } : {}),
        ...(b.variables !== undefined ? { variables: b.variables } : {}),
      },
    }),
  );
});
router.delete("/templates/:id", async (req, res) => {
  await prisma.template.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

router.get("/knowledge-base", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search : "";
  const category =
    typeof req.query.category === "string" ? req.query.category : "";
  const where: any = { published: true };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category) where.category = category;
  res.json(
    await prisma.knowledgeArticle.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { author: { select: { id: true, name: true } } },
    }),
  );
});
router.post("/knowledge-base", async (req, res) => {
  const b = req.body ?? {};
  res
    .status(201)
    .json(
      await prisma.knowledgeArticle.create({
        data: {
          title: b.title,
          content: b.content,
          category: b.category ?? "general",
          authorId: req.user?.id ?? null,
        },
      }),
    );
});
router.put("/knowledge-base/:id", async (req, res) => {
  const b = req.body ?? {};
  res.json(
    await prisma.knowledgeArticle.update({
      where: { id: req.params.id },
      data: {
        ...(b.title !== undefined ? { title: b.title } : {}),
        ...(b.content !== undefined ? { content: b.content } : {}),
        ...(b.category !== undefined ? { category: b.category } : {}),
        ...(b.published !== undefined ? { published: b.published } : {}),
      },
    }),
  );
});
router.delete("/knowledge-base/:id", async (req, res) => {
  await prisma.knowledgeArticle.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

router.get("/dashboard/stats", async (req, res) => {
  const ownership =
    req.user?.role === "admin" || req.user?.role === "director"
      ? {}
      : { assignedToId: req.user?.id };
  const [
    totalLeads,
    newLeads,
    totalDeals,
    activeDeals,
    totalProperties,
    totalTasks,
    pendingTasks,
    todayTasks,
  ] = await Promise.all([
    prisma.lead.count({ where: ownership as any }),
    prisma.lead.count({ where: { ...(ownership as any), status: "new" } }),
    prisma.deal.count({ where: ownership as any }),
    prisma.deal.count({
      where: {
        ...(ownership as any),
        stage: { notIn: ["closed", "rejected"] },
      },
    }),
    prisma.property.count(),
    prisma.task.count({ where: ownership as any }),
    prisma.task.count({ where: { ...(ownership as any), status: "pending" } }),
    prisma.task.count({
      where: {
        ...(ownership as any),
        status: "pending",
        dueDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
  ]);
  const recentLeads = await prisma.lead.findMany({
    where: ownership as any,
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      source: true,
      status: true,
      createdAt: true,
    },
  });
  const dealsByStage = await prisma.deal.groupBy({
    by: ["stage"],
    _count: { id: true },
    where: ownership as any,
  });
  res.json({
    totalLeads,
    newLeads,
    totalDeals,
    activeDeals,
    totalProperties,
    totalTasks,
    pendingTasks,
    todayTasks,
    recentLeads,
    dealsByStage,
  });
});

router.get("/analytics/extended", async (req, res) => {
  const ownership =
    req.user?.role === "admin" || req.user?.role === "director"
      ? {}
      : { assignedToId: req.user?.id };
  const from = typeof req.query.from === "string" ? req.query.from : "";
  const to = typeof req.query.to === "string" ? req.query.to : "";
  const dateFilter: any = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) dateFilter.lte = new Date(to);
  const hasDate = Object.keys(dateFilter).length > 0;
  const [leads, deals, tasks, users] = await Promise.all([
    prisma.lead.findMany({
      where: {
        ...(ownership as any),
        ...(hasDate ? { createdAt: dateFilter } : {}),
      },
      select: {
        id: true,
        source: true,
        status: true,
        createdAt: true,
        assignedToId: true,
      },
    }),
    prisma.deal.findMany({
      where: {
        ...(ownership as any),
        ...(hasDate ? { createdAt: dateFilter } : {}),
      },
      select: {
        id: true,
        stage: true,
        amount: true,
        commission: true,
        createdAt: true,
        updatedAt: true,
        assignedToId: true,
      },
    }),
    prisma.task.findMany({
      where: {
        ...(ownership as any),
        ...(hasDate ? { createdAt: dateFilter } : {}),
      },
      select: {
        id: true,
        status: true,
        type: true,
        assignedToId: true,
        createdAt: true,
        completedAt: true,
      },
    }),
    prisma.user.findMany({ select: { id: true, name: true, email: true } }),
  ]);
  const avgResponseMs = leads.length
    ? leads.reduce(
        (s, l) => s + (Date.now() - new Date(l.createdAt).getTime()),
        0,
      ) / leads.length
    : 0;
  const agentStats = users.map((u) => ({
    id: u.id,
    name: u.name ?? u.email,
    leadsCount: leads.filter((l) => l.assignedToId === u.id).length,
    dealsCount: deals.filter((d) => d.assignedToId === u.id).length,
    tasksCompleted: tasks.filter(
      (t) => t.assignedToId === u.id && t.status === "completed",
    ).length,
  }));
  const closedDeals = deals.filter((d) => d.stage === "closed");
  const totalRevenue = closedDeals.reduce((s, d) => s + (d.amount ?? 0), 0);
  const totalCommission = closedDeals.reduce(
    (s, d) => s + (d.commission ?? 0),
    0,
  );
  const avgDealSize = closedDeals.length
    ? totalRevenue / closedDeals.length
    : 0;
  const stageConversion = [
    "new_lead",
    "contact_made",
    "meeting_scheduled",
    "meeting_held",
    "showing",
    "negotiation",
    "deposit",
    "documents",
    "closed",
    "aftercare",
    "rejected",
  ].map((stage) => ({
    stage,
    count: deals.filter((d) => d.stage === stage).length,
  }));
  res.json({
    avgResponseMs,
    agentStats,
    totalRevenue,
    totalCommission,
    avgDealSize,
    closedDealsCount: closedDeals.length,
    totalDeals: deals.length,
    stageConversion,
  });
});

router.get("/communications", async (req, res) => {
  const leadId = typeof req.query.leadId === "string" ? req.query.leadId : "";
  if (!leadId) return res.status(400).json({ error: "leadId required" });
  res.json(
    await prisma.communication.findMany({
      where: { leadId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  );
});
router.post("/communications", async (req, res) =>
  res
    .status(201)
    .json(
      await prisma.communication.create({
        data: { ...(req.body ?? {}), userId: req.user?.id ?? null },
        include: { user: { select: { id: true, name: true } } },
      }),
    ),
);

router.get("/aftercare-plans", async (_req, res) =>
  res.json(
    await prisma.aftercarePlan.findMany({
      include: { steps: { orderBy: { order: "asc" } } },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
  ),
);
router.put("/aftercare-plans", async (req, res) => {
  const b = req.body ?? {};
  if (!Array.isArray(b.items))
    return res.status(400).json({ error: "Invalid request" });
  await prisma.$transaction(
    b.items.map((i: any) =>
      prisma.aftercarePlan.update({
        where: { id: i.id },
        data: { order: i.order },
      }),
    ),
  );
  res.json({ ok: true });
});
router.post("/aftercare-plans", async (req, res) => {
  const { steps, ...data } = req.body ?? {};
  res
    .status(201)
    .json(
      await prisma.aftercarePlan.create({
        data: {
          ...data,
          steps: Array.isArray(steps) ? { create: steps } : undefined,
        },
        include: { steps: { orderBy: { order: "asc" } } },
      }),
    );
});
router.put("/aftercare-plans/:id", async (req, res) => {
  const { steps, ...data } = req.body ?? {};
  if (Array.isArray(steps)) {
    await prisma.aftercareStep.deleteMany({ where: { planId: req.params.id } });
    if (steps.length)
      await prisma.aftercareStep.createMany({
        data: steps.map((s: any) => ({ ...s, planId: req.params.id })),
      });
  }
  res.json(
    await prisma.aftercarePlan.update({
      where: { id: req.params.id },
      data,
      include: { steps: { orderBy: { order: "asc" } } },
    }),
  );
});
router.delete("/aftercare-plans/:id", async (req, res) => {
  await prisma.aftercarePlan.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

function toChatRoomDto(room: any, me: string) {
  const members = (room.members ?? []).map((m: any) => m.user);
  const lastMessage = room.messages?.[0]
    ? {
        text: room.messages[0].text,
        sender: room.messages[0].sender
          ? { name: room.messages[0].sender.name ?? null }
          : null,
      }
    : null;
  const unreadCount = (room.messages ?? []).filter(
    (msg: any) => msg.senderId !== me,
  ).length;
  return {
    id: room.id,
    type: room.type,
    name: room.name,
    members,
    lastMessage,
    unreadCount,
  };
}

router.get("/chat", async (req, res) => {
  const me = req.user?.id;
  if (!me) return res.status(401).json({ error: "Unauthorized" });

  const roomId = typeof req.query.roomId === "string" ? req.query.roomId : "";
  const threadId =
    typeof req.query.threadId === "string" ? req.query.threadId : "";
  const directUserId =
    typeof req.query.userId === "string" ? req.query.userId : "";

  if (roomId) {
    const membership = await prisma.chatRoomMember.findUnique({
      where: { roomId_userId: { roomId, userId: me } },
    });
    if (!membership) return res.status(403).json({ error: "Not a member" });

    const where: any = { roomId };
    if (threadId) where.threadId = threadId;
    else where.threadId = null;

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: 300,
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        _count: { select: { replies: true } },
      },
    });

    await prisma.chatRoomMember.update({
      where: { roomId_userId: { roomId, userId: me } },
      data: { lastReadAt: new Date() },
    });
    await prisma.chatMessage.updateMany({
      where: { roomId, senderId: { not: me }, isRead: false },
      data: { isRead: true },
    });

    return res.json(messages);
  }

  if (directUserId) {
    const existing = await prisma.chatRoom.findFirst({
      where: {
        type: "direct",
        members: { some: { userId: me } },
        AND: [{ members: { some: { userId: directUserId } } }],
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, avatar: true, role: true } },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: { sender: { select: { name: true } } },
        },
      },
    });
    return res.json(existing ? [toChatRoomDto(existing, me)] : []);
  }

  const rooms = await prisma.chatRoom.findMany({
    where: { members: { some: { userId: me } } },
    orderBy: { updatedAt: "desc" },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, avatar: true, role: true } },
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        include: { sender: { select: { name: true } } },
      },
    },
  });

  const memberships = await prisma.chatRoomMember.findMany({
    where: { userId: me, roomId: { in: rooms.map((r) => r.id) } },
    select: { roomId: true, lastReadAt: true },
  });
  const readMap = new Map(memberships.map((m) => [m.roomId, m.lastReadAt]));

  const unreadCounts = await Promise.all(
    rooms.map((room) =>
      prisma.chatMessage.count({
        where: {
          roomId: room.id,
          senderId: { not: me },
          createdAt: { gt: readMap.get(room.id) ?? new Date(0) },
        },
      }),
    ),
  );

  const payload = rooms.map((room, idx) => {
    const dto = toChatRoomDto(room, me);
    return { ...dto, unreadCount: unreadCounts[idx] ?? 0 };
  });
  res.json(payload);
});

router.post("/chat", async (req, res) => {
  const me = req.user?.id;
  if (!me) return res.status(401).json({ error: "Unauthorized" });

  const action = req.body?.action as string | undefined;
  if (action === "createRoom") {
    const memberIds = Array.isArray(req.body?.memberIds)
      ? (req.body.memberIds as string[])
      : [];
    const name =
      req.body?.name !== undefined ? String(req.body.name || "") : undefined;
    const uniqMemberIds = Array.from(new Set([me, ...memberIds])).filter(Boolean);
    if (uniqMemberIds.length < 2) {
      return res.status(400).json({ error: "At least 2 members required" });
    }

    if (!name && uniqMemberIds.length === 2) {
      const otherId = uniqMemberIds.find((id) => id !== me)!;
      const existingDirect = await prisma.chatRoom.findFirst({
        where: {
          type: "direct",
          members: { some: { userId: me } },
          AND: [{ members: { some: { userId: otherId } } }],
        },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true, role: true },
              },
            },
          },
        },
      });
      if (existingDirect) return res.status(200).json(existingDirect);
    }

    const roomType = name || uniqMemberIds.length > 2 ? "group" : "direct";
    const room = await prisma.chatRoom.create({
      data: {
        name: name || null,
        type: roomType,
        createdById: me,
        members: {
          create: uniqMemberIds.map((userId) => ({ userId })),
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, avatar: true, role: true } },
          },
        },
      },
    });
    return res.status(201).json(room);
  }

  const roomId = req.body?.roomId as string | undefined;
  const text = req.body?.text as string | undefined;
  const mentions = Array.isArray(req.body?.mentions)
    ? (req.body.mentions as string[])
    : [];
  const threadId = req.body?.threadId as string | undefined;

  if (!roomId || !text?.trim()) {
    return res.status(400).json({ error: "Missing roomId or text" });
  }

  const membership = await prisma.chatRoomMember.findUnique({
    where: { roomId_userId: { roomId, userId: me } },
  });
  if (!membership) return res.status(403).json({ error: "Not a member" });

  const roomMembers = await prisma.chatRoomMember.findMany({
    where: { roomId },
    select: { userId: true },
  });
  const otherMember =
    roomMembers.find((m) => m.userId !== me)?.userId ?? me;

  const message = await prisma.chatMessage.create({
    data: {
      roomId,
      senderId: me,
      receiverId: otherMember,
      text: text.trim(),
      threadId: threadId || null,
      mentions: mentions.length
        ? {
            create: mentions
              .filter((uid) => roomMembers.some((m) => m.userId === uid))
              .map((uid) => ({ userId: uid })),
          }
        : undefined,
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
      _count: { select: { replies: true } },
    },
  });

  await prisma.chatRoom.update({ where: { id: roomId }, data: { updatedAt: new Date() } });
  res.status(201).json(message);
});

router.get("/property-units", async (req, res) => {
  const propertyId =
    typeof req.query.propertyId === "string" ? req.query.propertyId : "";
  if (!propertyId)
    return res.status(400).json({ error: "propertyId required" });
  res.json(
    await prisma.propertyUnit.findMany({
      where: { propertyId },
      orderBy: [{ section: "asc" }, { floor: "desc" }, { unitNumber: "asc" }],
    }),
  );
});
router.post("/property-units", async (req, res) =>
  res
    .status(201)
    .json(await prisma.propertyUnit.create({ data: req.body ?? {} })),
);
router.put("/property-units", async (req, res) => {
  const { id, ...data } = req.body ?? {};
  res.json(await prisma.propertyUnit.update({ where: { id }, data }));
});
router.delete("/property-units", async (req, res) => {
  const id = typeof req.query.id === "string" ? req.query.id : "";
  if (!id) return res.status(400).json({ error: "id required" });
  await prisma.propertyUnit.delete({ where: { id } });
  res.json({ ok: true });
});

router.get("/files", async (req, res) => {
  const path = typeof req.query.path === "string" ? req.query.path : "";
  if (!path) return res.status(400).json({ error: "path required" });
  res.redirect(await getFileUrl(path, path.includes("/public/")));
});
router.post("/upload/presigned", async (req, res) => {
  const { fileName, contentType, isPublic } = req.body ?? {};
  if (!fileName || !contentType)
    return res.status(400).json({ error: "Missing fileName or contentType" });
  res.json(
    await generatePresignedUploadUrl(
      String(fileName),
      String(contentType),
      Boolean(isPublic ?? true),
    ),
  );
});

router.get("/lead-distribution", async (_req, res) =>
  res.json(
    await prisma.leadDistributionRule.findMany({
      include: { assignTo: { select: { id: true, name: true } } },
      orderBy: { priority: "desc" },
    }),
  ),
);
router.post("/lead-distribution", async (req, res) =>
  res
    .status(201)
    .json(
      await prisma.leadDistributionRule.create({
        data: req.body ?? {},
        include: { assignTo: { select: { id: true, name: true } } },
      }),
    ),
);
router.put("/lead-distribution", async (req, res) => {
  const b = req.body ?? {};
  if (Array.isArray(b.items)) {
    await prisma.$transaction(
      b.items.map((i: any) =>
        prisma.leadDistributionRule.update({
          where: { id: i.id },
          data: { priority: i.priority },
        }),
      ),
    );
    return res.json({ ok: true });
  }
  const { id, ...data } = b;
  res.json(
    await prisma.leadDistributionRule.update({
      where: { id },
      data,
      include: { assignTo: { select: { id: true, name: true } } },
    }),
  );
});
router.delete("/lead-distribution", async (req, res) => {
  const id = typeof req.query.id === "string" ? req.query.id : "";
  if (!id) return res.status(400).json({ error: "id required" });
  await prisma.leadDistributionRule.delete({ where: { id } });
  res.json({ ok: true });
});

router.get("/deals/custom-field-values", async (req, res) => {
  const dealId = typeof req.query.dealId === "string" ? req.query.dealId : "";
  if (!dealId) return res.status(400).json({ error: "dealId required" });
  res.json(
    await prisma.dealCustomFieldValue.findMany({
      where: { dealId },
      include: { field: true },
    }),
  );
});
router.post("/deals/custom-field-values", async (req, res) => {
  const { dealId, fieldId, value } = req.body ?? {};
  res.json(
    await prisma.dealCustomFieldValue.upsert({
      where: { dealId_fieldId: { dealId, fieldId } },
      update: { value },
      create: { dealId, fieldId, value },
    }),
  );
});

router.get("/automations", async (_req, res) =>
  res.json(
    await prisma.automation.findMany({
      orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { id: true, name: true } } },
    }),
  ),
);
router.post("/automations", async (req, res) => {
  const b = req.body ?? {};
  res
    .status(201)
    .json(
      await prisma.automation.create({
        data: {
          name: b.name,
          description: b.description ?? null,
          trigger: b.trigger,
          triggerValue: b.triggerValue ?? null,
          action: b.action,
          actionValue: b.actionValue ?? null,
          isActive: b.isActive ?? true,
          createdById: req.user?.id ?? null,
        },
      }),
    );
});
router.put("/automations/:id", async (req, res) => {
  const b = req.body ?? {};
  res.json(
    await prisma.automation.update({
      where: { id: req.params.id },
      data: {
        ...(b.name !== undefined ? { name: b.name } : {}),
        ...(b.description !== undefined ? { description: b.description } : {}),
        ...(b.trigger !== undefined ? { trigger: b.trigger } : {}),
        ...(b.triggerValue !== undefined
          ? { triggerValue: b.triggerValue }
          : {}),
        ...(b.action !== undefined ? { action: b.action } : {}),
        ...(b.actionValue !== undefined ? { actionValue: b.actionValue } : {}),
        ...(b.isActive !== undefined ? { isActive: b.isActive } : {}),
      },
    }),
  );
});
router.delete("/automations/:id", async (req, res) => {
  await prisma.automation.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

router.post("/leads/:id/create-deal", async (req, res) => {
  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!lead) return res.status(404).json({ error: "Lead not found" });
  const b = req.body ?? {};
  const deal = await prisma.deal.create({
    data: {
      title:
        b.title || `Угода: ${lead.firstName} ${lead.lastName || ""}`.trim(),
      stage: "new_lead",
      leadId: lead.id,
      assignedToId: lead.assignedToId || req.user?.id || null,
      amount: lead.budget || null,
      propertyId: b.propertyId || null,
    },
  });
  await prisma.lead.update({
    where: { id: lead.id },
    data: { status: "active" },
  });
  res.status(201).json(deal);
});

router.get("/deals/:id/comments", async (req, res) =>
  res.json(
    await prisma.dealComment.findMany({
      where: { dealId: req.params.id },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true, email: true } } },
    }),
  ),
);
router.post("/deals/:id/comments", async (req, res) =>
  res
    .status(201)
    .json(
      await prisma.dealComment.create({
        data: {
          dealId: req.params.id,
          text: req.body?.text,
          authorId: req.user?.id ?? null,
        },
        include: { author: { select: { id: true, name: true, email: true } } },
      }),
    ),
);
router.get("/deals/:id/checklist", async (req, res) =>
  res.json(
    await prisma.dealChecklist.findMany({
      where: { dealId: req.params.id },
      orderBy: { order: "asc" },
    }),
  ),
);
router.post("/deals/:id/checklist", async (req, res) =>
  res
    .status(201)
    .json(
      await prisma.dealChecklist.create({
        data: {
          dealId: req.params.id,
          title: req.body?.title,
          order: req.body?.order ?? 0,
        },
      }),
    ),
);
router.put("/deals/:id/checklist", async (req, res) =>
  res.json(
    await prisma.dealChecklist.update({
      where: { id: req.body?.itemId },
      data: { completed: req.body?.completed },
    }),
  ),
);

router.get("/events", async (req, res) => {
  const month = typeof req.query.month === "string" ? req.query.month : "";
  const year = typeof req.query.year === "string" ? req.query.year : "";
  const where: any = {};
  if (month && year) {
    where.startDate = {
      gte: new Date(Number(year), Number(month) - 1, 1),
      lte: new Date(Number(year), Number(month), 0, 23, 59, 59),
    };
  }
  res.json(
    await prisma.event.findMany({
      where,
      orderBy: { startDate: "asc" },
      take: 200,
      include: { user: { select: { id: true, name: true } } },
    }),
  );
});
router.post("/events", async (req, res) => {
  const b = req.body ?? {};
  res
    .status(201)
    .json(
      await prisma.event.create({
        data: {
          title: b.title,
          description: b.description ?? null,
          type: b.type ?? "meeting",
          startDate: new Date(b.startDate),
          endDate: b.endDate ? new Date(b.endDate) : null,
          allDay: b.allDay ?? false,
          userId: req.user?.id ?? null,
        },
      }),
    );
});
router.put("/events/:id", async (req, res) => {
  const b = req.body ?? {};
  res.json(
    await prisma.event.update({
      where: { id: req.params.id },
      data: {
        title: b.title,
        description: b.description ?? null,
        type: b.type ?? "meeting",
        startDate: new Date(b.startDate),
        endDate: b.endDate ? new Date(b.endDate) : null,
        allDay: b.allDay ?? false,
      },
    }),
  );
});
router.delete("/events/:id", async (req, res) => {
  await prisma.event.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

router.get("/leads", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search : "";
  const status = typeof req.query.status === "string" ? req.query.status : "";
  const source = typeof req.query.source === "string" ? req.query.source : "";
  const managerId =
    typeof req.query.managerId === "string" ? req.query.managerId : "";
  const ownership =
    req.user?.role === "admin" || req.user?.role === "director"
      ? {}
      : { assignedToId: req.user?.id };
  const where: any = { ...ownership };
  if (search)
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  if (status) where.status = status;
  if (source) where.source = source;
  if (managerId) where.assignedToId = managerId;
  res.json(
    await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        assignedTo: { select: { id: true, name: true, avatar: true } },
      },
    }),
  );
});
router.post("/leads", async (req, res) => {
  const b = req.body ?? {};
  let assignedToId = b.assignedToId || req.user?.id || null;
  if (!b.assignedToId) {
    const rules = await prisma.leadDistributionRule.findMany({
      where: { isActive: true },
      orderBy: { priority: "desc" },
    });
    for (const rule of rules) {
      const sourceMatch =
        !rule.source || rule.source === (b.source || "manual");
      const districtMatch =
        !rule.district || rule.district === (b.districts || "");
      const typeMatch =
        !rule.propertyType || rule.propertyType === (b.propertyType || "");
      const needMatch =
        !rule.needType || rule.needType === (b.needType || "buy");
      if (sourceMatch && districtMatch && typeMatch && needMatch) {
        assignedToId = rule.assignToId;
        break;
      }
    }
  }
  res
    .status(201)
    .json(
      await prisma.lead.create({
        data: {
          firstName: b.firstName,
          lastName: b.lastName ?? null,
          email: b.email ?? null,
          phone: b.phone,
          source: b.source ?? "manual",
          status: b.status ?? "new",
          needType: b.needType ?? "buy",
          budget: b.budget ? parseFloat(b.budget) : null,
          budgetMax: b.budgetMax ? parseFloat(b.budgetMax) : null,
          districts: b.districts ?? null,
          propertyType: b.propertyType ?? null,
          notes: b.notes ?? null,
          priority: b.priority ?? "medium",
          assignedToId,
        },
      }),
    );
});
router.get("/leads/:id", async (req, res) => {
  const lead = await prisma.lead.findUnique({
    where: { id: req.params.id },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      deals: true,
      tasks: true,
    },
  });
  if (!lead) return res.status(404).json({ error: "Not found" });
  if (
    !(req.user?.role === "admin" || req.user?.role === "director") &&
    lead.assignedToId !== req.user?.id
  )
    return res.status(403).json({ error: "Forbidden" });
  res.json(lead);
});
router.put("/leads/:id", async (req, res) => {
  const b = req.body ?? {};
  const old = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!old) return res.status(404).json({ error: "Not found" });
  if (
    !(req.user?.role === "admin" || req.user?.role === "director") &&
    old.assignedToId !== req.user?.id
  )
    return res.status(403).json({ error: "Forbidden" });
  res.json(
    await prisma.lead.update({
      where: { id: req.params.id },
      data: {
        ...(b.firstName !== undefined ? { firstName: b.firstName } : {}),
        ...(b.lastName !== undefined ? { lastName: b.lastName } : {}),
        ...(b.email !== undefined ? { email: b.email } : {}),
        ...(b.phone !== undefined ? { phone: b.phone } : {}),
        ...(b.source !== undefined ? { source: b.source } : {}),
        ...(b.status !== undefined ? { status: b.status } : {}),
        ...(b.needType !== undefined ? { needType: b.needType } : {}),
        ...(b.budget !== undefined
          ? { budget: b.budget ? parseFloat(b.budget) : null }
          : {}),
        ...(b.priority !== undefined ? { priority: b.priority } : {}),
        ...(b.notes !== undefined ? { notes: b.notes } : {}),
        ...(b.districts !== undefined ? { districts: b.districts } : {}),
        ...(b.propertyType !== undefined
          ? { propertyType: b.propertyType }
          : {}),
        ...(b.assignedToId !== undefined
          ? { assignedToId: b.assignedToId || null }
          : {}),
      },
    }),
  );
});
router.delete("/leads/:id", async (req, res) => {
  await prisma.lead.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

router.post("/leads/bulk", async (req, res) => {
  const { ids, action, value } = req.body ?? {};
  if (!Array.isArray(ids) || !ids.length)
    return res.status(400).json({ error: "No ids" });
  const ownership =
    req.user?.role === "admin" || req.user?.role === "director"
      ? {}
      : { assignedToId: req.user?.id };
  const where: any = { id: { in: ids }, ...ownership };
  if (action === "delete")
    return res.json({
      deleted: (await prisma.lead.deleteMany({ where })).count,
    });
  if (action === "status" && value)
    return res.json({
      updated: (
        await prisma.lead.updateMany({ where, data: { status: value } })
      ).count,
    });
  if (action === "assign" && value)
    return res.json({
      updated: (
        await prisma.lead.updateMany({ where, data: { assignedToId: value } })
      ).count,
    });
  res.status(400).json({ error: "Invalid action" });
});
router.post("/leads/import", async (req, res) => {
  const { leads } = req.body ?? {};
  if (!Array.isArray(leads) || !leads.length)
    return res.status(400).json({ error: "No leads provided" });
  let imported = 0,
    skipped = 0;
  const errors: string[] = [];
  for (let i = 0; i < leads.length; i++) {
    const row = leads[i];
    const firstName = String(row.firstName || row.name || "").trim();
    const phone = String(row.phone || "").trim();
    if (!firstName || !phone) {
      skipped++;
      errors.push(`row ${i + 2}: missing firstName or phone`);
      continue;
    }
    try {
      await prisma.lead.create({
        data: {
          firstName,
          lastName: String(row.lastName || "").trim() || null,
          phone,
          email: String(row.email || "").trim() || null,
          source: row.source || "manual",
          status: "new",
          needType: row.needType || "buy",
          budget: row.budget ? parseFloat(row.budget) : null,
          districts: String(row.districts || "").trim() || null,
          propertyType: String(row.propertyType || "").trim() || null,
          notes: String(row.notes || "").trim() || null,
          assignedToId: req.user?.id || null,
        },
      });
      imported++;
    } catch (e: any) {
      skipped++;
      errors.push(
        `row ${i + 2}: ${String(e?.message || "error").slice(0, 80)}`,
      );
    }
  }
  res.json({ imported, skipped, errors: errors.slice(0, 10) });
});

router.get("/deals", async (_req, res) => {
  const ownership =
    _req.user?.role === "admin" || _req.user?.role === "director"
      ? {}
      : { assignedToId: _req.user?.id };
  res.json(
    await prisma.deal.findMany({
      where: ownership as any,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        lead: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
        property: { select: { id: true, title: true, address: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } },
      },
    }),
  );
});
router.post("/deals", async (req, res) => {
  const b = req.body ?? {};
  res
    .status(201)
    .json(
      await prisma.deal.create({
        data: {
          title: b.title,
          stage: b.stage ?? "new_lead",
          amount: b.amount ? parseFloat(b.amount) : null,
          commission: b.commission ? parseFloat(b.commission) : null,
          currency: b.currency ?? "USD",
          leadId: b.leadId ?? null,
          propertyId: b.propertyId ?? null,
          assignedToId: b.assignedToId ?? req.user?.id ?? null,
          notes: b.notes ?? null,
        },
      }),
    );
});
router.get("/deals/:id", async (req, res) => {
  const d = await prisma.deal.findUnique({
    where: { id: req.params.id },
    include: {
      lead: true,
      property: true,
      assignedTo: { select: { id: true, name: true } },
    },
  });
  if (!d) return res.status(404).json({ error: "Not found" });
  res.json(d);
});
router.put("/deals/:id", async (req, res) => {
  const b = req.body ?? {};
  res.json(
    await prisma.deal.update({
      where: { id: req.params.id },
      data: {
        ...(b.title !== undefined ? { title: b.title } : {}),
        ...(b.stage !== undefined ? { stage: b.stage } : {}),
        ...(b.amount !== undefined
          ? { amount: b.amount ? parseFloat(b.amount) : null }
          : {}),
        ...(b.commission !== undefined
          ? { commission: b.commission ? parseFloat(b.commission) : null }
          : {}),
        ...(b.currency !== undefined ? { currency: b.currency } : {}),
        ...(b.leadId !== undefined ? { leadId: b.leadId } : {}),
        ...(b.propertyId !== undefined ? { propertyId: b.propertyId } : {}),
        ...(b.notes !== undefined ? { notes: b.notes } : {}),
      },
    }),
  );
});
router.delete("/deals/:id", async (req, res) => {
  await prisma.deal.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

router.get("/properties", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search : "";
  const status = typeof req.query.status === "string" ? req.query.status : "";
  const type = typeof req.query.type === "string" ? req.query.type : "";
  const where: any = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (search)
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
    ];
  res.json(
    await prisma.property.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  );
});
function parseNullableInt(v: any): number | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}

function parseNullableFloat(v: any): number | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function normalizePropertyPayload(raw: any): any {
  const b = raw ?? {};
  const payload: any = { ...b };
  payload.rooms = parseNullableInt(b.rooms);
  payload.area = parseNullableFloat(b.area);
  payload.floor = parseNullableInt(b.floor);
  payload.totalFloors = parseNullableInt(b.totalFloors);
  payload.price = parseNullableFloat(b.price);
  payload.district = b.district === "" ? null : b.district;
  payload.description = b.description === "" ? null : b.description;
  return payload;
}

router.post("/properties", async (req, res) => {
  const payload = normalizePropertyPayload(req.body);
  if (payload.price === undefined || payload.price === null) {
    return res.status(400).json({ error: "price is required" });
  }
  res.status(201).json(await prisma.property.create({ data: payload }));
});

router.put("/properties/:id", async (req, res) => {
  const payload = normalizePropertyPayload(req.body);
  res.json(
    await prisma.property.update({
      where: { id: req.params.id },
      data: payload,
    }),
  );
});
router.delete("/properties/:id", async (req, res) => {
  await prisma.property.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

router.get("/tasks", async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : "";
  const type = typeof req.query.type === "string" ? req.query.type : "";
  const priority =
    typeof req.query.priority === "string" ? req.query.priority : "";
  const ownership =
    req.user?.role === "admin" || req.user?.role === "director"
      ? {}
      : { assignedToId: req.user?.id };
  const where: any = { ...ownership };
  if (status) where.status = status;
  if (type) where.type = type;
  if (priority) where.priority = priority;
  res.json(
    await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 300,
      include: {
        lead: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
  );
});
router.post("/tasks", async (req, res) => {
  const body = req.body ?? {};
  const dueDateRaw = body.dueDate;
  if (dueDateRaw) {
    const parsed = new Date(String(dueDateRaw));
    if (Number.isNaN(parsed.getTime())) {
      return res.status(400).json({ error: "Invalid dueDate format" });
    }
    body.dueDate = parsed.toISOString();
  } else if (dueDateRaw === "" || dueDateRaw === null) {
    body.dueDate = null;
  }

  res.status(201).json(
    await prisma.task.create({
      data: {
        ...body,
        assignedToId: body.assignedToId ?? req.user?.id ?? null,
      },
    }),
  );
});

router.put("/tasks/:id", async (req, res) => {
  const body = req.body ?? {};
  const dueDateRaw = body.dueDate;
  if (dueDateRaw !== undefined) {
    if (dueDateRaw === "" || dueDateRaw === null) {
      body.dueDate = null;
    } else {
      const parsed = new Date(String(dueDateRaw));
      if (Number.isNaN(parsed.getTime())) {
        return res.status(400).json({ error: "Invalid dueDate format" });
      }
      body.dueDate = parsed.toISOString();
    }
  }

  res.json(
    await prisma.task.update({
      where: { id: req.params.id },
      data: body,
    }),
  );
});
router.delete("/tasks/:id", async (req, res) => {
  await prisma.task.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

router.get("/settings/brand", async (req, res) => {
  res.json(
    (await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        brandName: true,
        brandLogo: true,
        primaryColor: true,
        themeMode: true,
        sidebarGlass: true,
        sidebarOpacity: true,
        gradientBg: true,
      },
    })) ?? {},
  );
});
router.put("/settings/brand", async (req, res) => {
  const b = req.body ?? {};
  const data: any = {};
  if (b.brandName !== undefined) data.brandName = b.brandName || null;
  if (b.brandLogo !== undefined) data.brandLogo = b.brandLogo || null;
  if (b.primaryColor !== undefined) data.primaryColor = b.primaryColor || null;
  if (b.themeMode !== undefined) data.themeMode = b.themeMode || "light";
  if (b.sidebarGlass !== undefined) data.sidebarGlass = !!b.sidebarGlass;
  if (b.sidebarOpacity !== undefined)
    data.sidebarOpacity =
      typeof b.sidebarOpacity === "number" ? b.sidebarOpacity : 1;
  if (b.gradientBg !== undefined) data.gradientBg = !!b.gradientBg;
  res.json(
    await prisma.user.update({
      where: { id: req.user!.id },
      data,
      select: {
        brandName: true,
        brandLogo: true,
        primaryColor: true,
        themeMode: true,
        sidebarGlass: true,
        sidebarOpacity: true,
        gradientBg: true,
      },
    }),
  );
});

router.put("/users/plan", async (req, res) => {
  const plan = req.body?.plan;
  if (!["free", "pro", "business"].includes(plan))
    return res.status(400).json({ error: "Invalid plan" });
  const updateData: any = { plan };
  if (plan === "business") updateData.accountType = "agency";
  const u = await prisma.user.update({
    where: { id: req.user!.id },
    data: updateData,
  });
  res.json({ plan: u.plan, accountType: u.accountType });
});

router.get("/notifications", async (req, res) => {
  const now = new Date();
  const ownership =
    req.user?.role === "admin" || req.user?.role === "director"
      ? {}
      : { assignedToId: req.user?.id };
  const recentLogs = await prisma.activityLog.findMany({
    where: {
      createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      ...(req.user?.role === "agent" ? { userId: req.user?.id } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { user: { select: { name: true } } },
  });
  const overdueTasks = await prisma.task.findMany({
    where: { ...(ownership as any), status: "pending", dueDate: { lt: now } },
    select: { id: true, title: true, dueDate: true },
    take: 5,
  });
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const newLeadsCount = await prisma.lead.count({
    where: { ...(ownership as any), createdAt: { gte: todayStart } },
  });
  const notifications = [
    ...overdueTasks.map((t) => ({
      id: `task-${t.id}`,
      type: "overdue_task",
      title: t.title,
      href: "/tasks",
      time: t.dueDate,
    })),
    ...recentLogs.map((log) => ({
      id: `log-${log.id}`,
      type: log.action,
      title: log.details || `${log.action} ${log.entityType}`,
      href:
        log.entityType === "lead"
          ? `/leads/${log.entityId}`
          : log.entityType === "deal"
            ? `/deals/${log.entityId}`
            : "/activity-log",
      time: log.createdAt,
      actor: log.user?.name,
    })),
  ];
  res.json({
    notifications,
    overdue: overdueTasks.length,
    newLeadsToday: newLeadsCount,
  });
});

let exchangeRateCache: {
  rate: number;
  date: string;
  fetchedAt: number;
} | null = null;
router.get("/exchange-rate", async (_req, res) => {
  try {
    if (
      exchangeRateCache &&
      Date.now() - exchangeRateCache.fetchedAt < 60 * 60 * 1000
    )
      return res.json(exchangeRateCache);
    const response = await fetch(
      "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchangenew?json&valcode=USD",
    );
    if (!response.ok) throw new Error("NBU API error");
    const data: any = await response.json();
    const usdRate = data?.[0]?.rate;
    const exchangeDate = data?.[0]?.exchangedate;
    if (!usdRate) throw new Error("No rate data");
    exchangeRateCache = {
      rate: usdRate,
      date: exchangeDate,
      fetchedAt: Date.now(),
    };
    res.json(exchangeRateCache);
  } catch (err: any) {
    if (exchangeRateCache)
      return res.json({ ...exchangeRateCache, stale: true });
    res.status(500).json({ error: err?.message ?? "Failed to fetch rate" });
  }
});

router.get("/calendar/token", async (req, res) => {
  const u = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { calendarToken: true },
  });
  res.json({ token: u?.calendarToken ?? null });
});
router.post("/calendar/token", async (req, res) => {
  const token = (await import("crypto")).randomBytes(32).toString("hex");
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { calendarToken: token },
  });
  res.json({ token });
});
router.delete("/calendar/token", async (req, res) => {
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { calendarToken: null },
  });
  res.json({ success: true });
});
router.get("/calendar/ics", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  if (!token) return res.status(400).send("Missing token");
  const user = await prisma.user.findFirst({
    where: { calendarToken: token },
    select: { id: true, name: true },
  });
  if (!user) return res.status(401).send("Invalid token");
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 12, 0);
  const events = await prisma.event.findMany({
    where: { startDate: { gte: from, lte: to } },
    orderBy: { startDate: "asc" },
    take: 500,
  });
  const esc = (s: string) =>
    (s || "")
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  const d2 = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FREEMO R//Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:FREEMO R - ${esc(user.name || "Calendar")}`,
  ];
  for (const ev of events) {
    const start = new Date(ev.startDate);
    const end = ev.endDate
      ? new Date(ev.endDate)
      : new Date(start.getTime() + 3600000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${ev.id}@freemor`,
      `DTSTART:${d2(start)}`,
      `DTEND:${d2(end)}`,
      `SUMMARY:${esc(ev.title)}`,
    );
    if (ev.description) lines.push(`DESCRIPTION:${esc(ev.description)}`);
    lines.push(
      `CATEGORIES:${ev.type || "other"}`,
      `DTSTAMP:${d2(new Date(ev.createdAt))}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    'inline; filename=\"freemor-calendar.ics\"',
  );
  res.send(lines.join("\r\n"));
});

router.get("/search", async (req, res) => {
  const q = (typeof req.query.q === "string" ? req.query.q : "").trim();
  if (!q || q.length < 2)
    return res.json({ leads: [], deals: [], properties: [], tasks: [] });
  const ownership =
    req.user?.role === "admin" || req.user?.role === "director"
      ? {}
      : { assignedToId: req.user?.id };
  const [leads, deals, properties, tasks] = await Promise.all([
    prisma.lead.findMany({
      where: {
        ...(ownership as any),
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
      },
      take: 5,
    }),
    prisma.deal.findMany({
      where: {
        ...(ownership as any),
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { notes: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, stage: true, amount: true },
      take: 5,
    }),
    prisma.property.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { address: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, address: true, type: true },
      take: 5,
    }),
    prisma.task.findMany({
      where: {
        ...(ownership as any),
        title: { contains: q, mode: "insensitive" },
      },
      select: { id: true, title: true, status: true, priority: true },
      take: 5,
    }),
  ]);
  res.json({ leads, deals, properties, tasks });
});

router.get("/helper", async (req, res) => {
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );
  const used = await prisma.helperMessage.count({
    where: {
      userId: req.user!.id,
      role: "user",
      createdAt: { gte: monthStart },
    },
  });
  const history = await prisma.helperMessage.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { role: true, content: true, createdAt: true },
  });
  res.json({
    used,
    limit: 200,
    plan: "free",
    remaining: Math.max(0, 200 - used),
    history: history.reverse(),
  });
});
router.post("/helper", async (req, res) => {
  const message = String(req.body?.message || "").trim();
  if (!message) return res.status(400).json({ error: "Message required" });
  await prisma.helperMessage.create({
    data: { userId: req.user!.id, role: "user", content: message },
  });
  const reply = "Отримав запит. Базовий режим хелпера активний після міграції.";
  await prisma.helperMessage.create({
    data: { userId: req.user!.id, role: "assistant", content: reply },
  });
  res.json({ content: reply, done: true, used: 1, limit: 200 });
});
router.post("/assistant", async (req, res) => {
  const message = String(req.body?.message || "").trim();
  if (!message) return res.status(400).json({ error: "Message required" });
  await prisma.helperMessage.create({
    data: {
      userId: req.user!.id,
      role: "user",
      content: `[assistant] ${message}`,
    },
  });
  const reply =
    "Асистент у безпечному режимі після міграції. Інтелектуальний запит підключимо наступним кроком.";
  await prisma.helperMessage.create({
    data: {
      userId: req.user!.id,
      role: "assistant",
      content: `[assistant] ${reply}`,
    },
  });
  res.json({ content: reply, done: true, used: 1, limit: 200 });
});

router.put("/chat/rooms", async (req, res) => {
  const userId = req.user!.id;
  const { roomId, name, addMemberIds, removeMemberIds } = req.body ?? {};
  if (!roomId) return res.status(400).json({ error: "Missing roomId" });
  const membership = await prisma.chatRoomMember.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });
  if (!membership) return res.status(403).json({ error: "Not a member" });
  if (name !== undefined)
    await prisma.chatRoom.update({ where: { id: roomId }, data: { name } });
  if (Array.isArray(addMemberIds)) {
    for (const mid of addMemberIds)
      await prisma.chatRoomMember.upsert({
        where: { roomId_userId: { roomId, userId: mid } },
        create: { roomId, userId: mid },
        update: {},
      });
    const count = await prisma.chatRoomMember.count({ where: { roomId } });
    if (count > 2)
      await prisma.chatRoom.update({
        where: { id: roomId },
        data: { type: "group" },
      });
  }
  if (Array.isArray(removeMemberIds))
    await prisma.chatRoomMember.deleteMany({
      where: { roomId, userId: { in: removeMemberIds } },
    });
  res.json(
    await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, role: true },
            },
          },
        },
      },
    }),
  );
});
router.delete("/chat/rooms", async (req, res) => {
  const roomId = typeof req.query.roomId === "string" ? req.query.roomId : "";
  if (!roomId) return res.status(400).json({ error: "Missing roomId" });
  const membership = await prisma.chatRoomMember.findUnique({
    where: { roomId_userId: { roomId, userId: req.user!.id } },
  });
  if (!membership) return res.status(403).json({ error: "Not a member" });
  await prisma.chatMention.deleteMany({
    where: { message: { roomId } } as any,
  });
  await prisma.chatMessage.deleteMany({ where: { roomId } });
  await prisma.chatRoomMember.deleteMany({ where: { roomId } });
  await prisma.chatRoom.delete({ where: { id: roomId } });
  res.json({ ok: true });
});

export const systemRoutes = router;
