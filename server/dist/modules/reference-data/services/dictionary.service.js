"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDictionaries = listDictionaries;
exports.addDictionary = addDictionary;
exports.changeDictionary = changeDictionary;
exports.removeDictionary = removeDictionary;
const errors_1 = require("../../../common/shared-kernel/errors");
const dictionary_repository_1 = require("../repositories/dictionary.repository");
function getId(value) {
    const id = String(value ?? '').trim();
    if (!id)
        throw (0, errors_1.badRequest)('id required');
    return id;
}
async function listDictionaries(category) {
    return (0, dictionary_repository_1.findActiveDictionaries)(category);
}
async function addDictionary(data) {
    return (0, dictionary_repository_1.createDictionary)(data);
}
async function changeDictionary(input) {
    if (Array.isArray(input.items)) {
        await (0, dictionary_repository_1.updateDictionaryOrder)(input.items);
        return { ok: true };
    }
    const id = getId(input.id);
    const { id: _id, items: _items, ...data } = input;
    return (0, dictionary_repository_1.updateDictionary)(id, data);
}
async function removeDictionary(idInput) {
    await (0, dictionary_repository_1.deactivateDictionary)(getId(idInput));
    return { ok: true };
}
