import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email обязателен' })
    .min(1, 'Email обязателен')
    .email('Неверный формат email'),
  password: z
    .string({ required_error: 'Пароль обязателен' })
    .min(1, 'Пароль обязателен')
    .max(128, 'Пароль слишком длинный'),
});

export const signupSchema = z.object({
  accountType: z.enum(['agent', 'agency'], {
    required_error: 'Выберите тип аккаунта',
    invalid_type_error: 'Неверный тип аккаунта',
  }),
  name: z
    .string({ required_error: 'Имя обязательно' })
    .min(2, 'Имя слишком короткое (минимум 2 символа)')
    .max(100, 'Имя слишком длинное'),
  email: z
    .string({ required_error: 'Email обязателен' })
    .min(1, 'Email обязателен')
    .email('Неверный формат email'),
  password: z
    .string({ required_error: 'Пароль обязателен' })
    .min(8, 'Пароль должен быть не менее 8 символов')
    .max(72, 'Пароль слишком длинный'),
});

export const leadSchema = z.object({
  firstName: z
    .string({ required_error: 'Имя обязательно' })
    .min(1, 'Имя обязательно')
    .max(100, 'Имя слишком длинное'),
  lastName: z.string().max(100, 'Фамилия слишком длинная').optional(),
  phone: z
    .string({ required_error: 'Телефон обязателен' })
    .min(1, 'Телефон обязателен')
    .max(30, 'Телефон слишком длинный'),
  email: z
    .string()
    .email('Неверный формат email')
    .max(254, 'Email слишком длинный')
    .optional()
    .or(z.literal('')),
  budget: z
    .number({ invalid_type_error: 'Бюджет должен быть числом' })
    .positive('Бюджет должен быть больше 0')
    .optional(),
  notes: z.string().max(2000, 'Заметки слишком длинные').optional(),
});

export const dealSchema = z.object({
  title: z
    .string({ required_error: 'Название обязательно' })
    .min(1, 'Название обязательно')
    .max(150, 'Название слишком длинное'),
  dealType: z.enum(['sale', 'rent']).optional(),
  amount: z
    .number({ invalid_type_error: 'Сумма должна быть числом' })
    .min(0, 'Сумма не может быть отрицательной')
    .optional(),
  commission: z
    .number({ invalid_type_error: 'Комиссия должна быть числом' })
    .min(0, 'Комиссия не может быть отрицательной')
    .max(100, 'Комиссия не может превышать 100%')
    .optional(),
  notes: z.string().max(2000, 'Заметки слишком длинные').optional(),
});

export const taskSchema = z.object({
  title: z
    .string({ required_error: 'Название обязательно' })
    .min(1, 'Название обязательно')
    .max(150, 'Название слишком длинное'),
  description: z.string().max(2000, 'Описание слишком длинное').optional(),
  dueDate: z.string({ required_error: 'Дата обязательна' }).min(1, 'Дата обязательна'),
});

export const propertySchema = z
  .object({
    title: z
      .string({ required_error: 'Название обязательно' })
      .min(1, 'Название обязательно')
      .max(200, 'Название слишком длинное'),
    address: z
      .string({ required_error: 'Адрес обязателен' })
      .min(1, 'Адрес обязателен')
      .max(500, 'Адрес слишком длинный'),
    price: z
      .number({ required_error: 'Цена обязательна', invalid_type_error: 'Цена должна быть числом' })
      .min(0, 'Цена не может быть отрицательной'),
    dealTypes: z
      .array(z.enum(['sale', 'rent']))
      .min(1, 'Выберите тип сделки'),
    floor: z.number({ invalid_type_error: 'Этаж должен быть числом' }).int().optional(),
    totalFloors: z
      .number({ invalid_type_error: 'Этажность должна быть числом' })
      .int()
      .optional(),
  })
  .refine(
    (data) => {
      if (data.floor != null && data.totalFloors != null) {
        return data.floor <= data.totalFloors;
      }
      return true;
    },
    { message: 'Этаж не может превышать этажность здания', path: ['floor'] },
  );
