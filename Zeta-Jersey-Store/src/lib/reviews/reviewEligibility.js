export function canReviewOrderItem(order, item, reviewedProductIds) {
  const productId = item.productId?._id;
  return order.orderStatus === "completed" && Boolean(productId) && item.productId.isActive !== false && !reviewedProductIds.has(String(productId));
}
