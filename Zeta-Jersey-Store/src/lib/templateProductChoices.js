const normalizeGroup = (value) => String(value || '').trim().toUpperCase();
const productGroups = (product) => [...new Set([product.groupId, product.personalizationGroupId].map(normalizeGroup).filter(Boolean))];

export function getTemplateProductGroups(products = []) {
  const groups = new Map();
  for (const product of products) {
    for (const id of productGroups(product)) {
      if (!groups.has(id)) groups.set(id, { id, names: [] });
      if (!groups.get(id).names.includes(product.name)) groups.get(id).names.push(product.name);
    }
  }
  return [...groups.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export function getTemplateProductImages(products = [], groupId = '') {
  const id = normalizeGroup(groupId);
  if (!id) return [];
  const matching = products.filter((product) => productGroups(product).includes(id));
  const choices = new Map();
  const add = (url, product, isBack = false) => {
    if (url && !choices.has(url)) choices.set(url, { url, productName: product.name, isBack });
  };
  for (const product of matching) add(product.backImageUrl, product, true);
  for (const product of matching) {
    for (const url of product.images || []) add(url, product);
  }
  return [...choices.values()];
}
