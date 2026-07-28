import { supabase } from "./supabase";

function generateId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

function mapCategory(row) {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
    icon: row.icon,
    imageURL: row.image_url || "",
    parentId: row.parent_id || null,
    discountPercent: Number(row.discount_percent) || 0,
  };
}

function mapModifier(row) {
  return {
    name: row.name,
    price: Number(row.additional_price),
  };
}

function mapProductSize(row) {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    sortOrder: row.sort_order,
  };
}

function mapProduct(row, modifiers = [], sizes = []) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    basePrice: Number(row.base_price),
    imageURL: row.image_url,
    categoryID: row.category_id,
    isAvailable: row.is_available,
    modifiers: modifiers.map(mapModifier),
    sizes: sizes.map(mapProductSize),
    discountPercent: Number(row.discount_percent) || 0,
  };
}

function mapDealItem(row) {
  return {
    productId: row.product_id,
    quantity: row.quantity,
    modifierNames: row.modifier_names || [],
  };
}

function mapDeal(row, items = []) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    badge: row.badge,
    price: Number(row.price),
    imageURL: row.image_url,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    items: items.map(mapDealItem),
  };
}

function mapOrderItem(row) {
  return {
    name: row.product_name,
    quantity: row.quantity,
    unitPrice: Number(row.unit_price),
    notes: row.notes,
    productId: row.product_id,
  };
}

function mapOrder(row, items = []) {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    status: row.status,
    totalAmount: Number(row.total_amount),
    deliveryFee: Number(row.delivery_fee) || 0,
    orderType: row.order_type,
    paymentMethod: row.payment_method,
    deliveryAddress: row.delivery_address || "",
    deliveryLat: row.delivery_lat ?? null,
    deliveryLng: row.delivery_lng ?? null,
    cancelReason: row.cancel_reason || "",
    isPaid: row.is_paid,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: items.map(mapOrderItem),
  };
}

async function fetchOrderWithItems(orderId) {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();
  if (orderError) throw orderError;

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);
  if (itemsError) throw itemsError;

  return mapOrder(order, items || []);
}

export const db = {
  async getCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return (data || []).map(mapCategory);
  },

  async getProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_modifiers(*), product_sizes(*)")
      .eq("is_available", true)
      .order("name");
    if (error) throw error;
    return (data || []).map((row) => {
      const modifiers = (row.product_modifiers || []).sort(
        (a, b) => a.sort_order - b.sort_order
      );
      const sizes = (row.product_sizes || []).sort(
        (a, b) => a.sort_order - b.sort_order
      );
      return mapProduct(row, modifiers, sizes);
    });
  },

  async getDeals() {
    const { data, error } = await supabase
      .from("deals")
      .select("*, deal_items(*)")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return (data || []).map((row) => {
      const items = (row.deal_items || []).sort((a, b) => a.sort_order - b.sort_order);
      return mapDeal(row, items);
    });
  },

  async getSiteSettings() {
    const { data, error } = await supabase.from("site_settings").select("*");
    if (error) throw error;
    const settings = {};
    (data || []).forEach((row) => {
      settings[row.key] = row.value;
    });
    return {
      taxRate: settings.tax_rate !== undefined ? parseFloat(settings.tax_rate) : 0.05,
      heroMode: settings.hero_mode || "carousel",
      heroTitle: settings.hero_title || "",
      heroSubtitle: settings.hero_subtitle || "",
      heroDescription: settings.hero_description || "",
      heroImageUrl: settings.hero_image_url || "",
      shopLat: settings.shop_lat ? parseFloat(settings.shop_lat) : null,
      shopLng: settings.shop_lng ? parseFloat(settings.shop_lng) : null,
      deliveryRadiusKm: settings.delivery_radius_km !== undefined ? parseFloat(settings.delivery_radius_km) : 5,
      deliveryFreeMinAmount: settings.delivery_free_min_amount !== undefined ? parseFloat(settings.delivery_free_min_amount) : 0,
      deliveryFreeMaxDistance: settings.delivery_free_max_distance !== undefined ? parseFloat(settings.delivery_free_max_distance) : 0,
      deliveryBaseFee: settings.delivery_base_fee !== undefined ? parseFloat(settings.delivery_base_fee) : 0,
      deliveryPerKmRate: settings.delivery_per_km_rate !== undefined ? parseFloat(settings.delivery_per_km_rate) : 0,
      deliveryMaxDistance: settings.delivery_max_distance !== undefined ? parseFloat(settings.delivery_max_distance) : 0,
      deliveryChargeType: settings.delivery_charge_type || "per_km",
      contactPhone: settings.contact_phone || "",
      contactEmail: settings.contact_email || "",
      contactAddress: settings.contact_address || "",
      socialFacebook: settings.social_facebook || "",
      socialInstagram: settings.social_instagram || "",
      socialTwitter: settings.social_twitter || "",
      socialTiktok: settings.social_tiktok || "",
      openHours: settings.open_hours || "",
    };
  },

  async getHeroImages() {
    const { data, error } = await supabase
      .from("hero_images")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return (data || []).map((row) => ({ id: row.id, imageURL: row.image_url }));
  },

  async getMyOrders(customerId) {
    if (!customerId) return [];
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => mapOrder(row, row.order_items || []));
  },

  async createOrder(order) {
    const id = generateId("order");
    const { items = [], ...orderFields } = order;

    const { error: orderError } = await supabase.from("orders").insert({
      id,
      customer_id: orderFields.customerId,
      customer_name: orderFields.customerName,
      customer_phone: orderFields.customerPhone || "",
      status: "Pending",
      total_amount: orderFields.totalAmount,
      delivery_fee: orderFields.deliveryFee || 0,
      order_type: orderFields.orderType,
      payment_method: "Cash",
      delivery_address: orderFields.orderType === "Delivery" ? orderFields.deliveryAddress || "" : "",
      delivery_lat: orderFields.orderType === "Delivery" ? orderFields.deliveryLat ?? null : null,
      delivery_lng: orderFields.orderType === "Delivery" ? orderFields.deliveryLng ?? null : null,
      is_paid: false,
      source: "Online",
    });
    if (orderError) throw orderError;

    if (items.length > 0) {
      const rows = items.map((item) => ({
        order_id: id,
        product_id: item.productId || null,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        notes: item.notes || "",
      }));
      const { error: itemsError } = await supabase.from("order_items").insert(rows);
      if (itemsError) throw itemsError;
    }

    return fetchOrderWithItems(id);
  },

  async getOrder(orderId) {
    return fetchOrderWithItems(orderId);
  },

  async getReviews(limit = 12) {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      orderId: row.order_id,
      customerName: row.customer_name,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.created_at,
    }));
  },

  async hasReview(orderId) {
    const { data, error } = await supabase.from("reviews").select("id").eq("order_id", orderId).maybeSingle();
    if (error) throw error;
    return !!data;
  },

  async getDeliveryZones() {
    const { data, error } = await supabase.from("delivery_zones").select("*").order("sort_order");
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      minKm: Number(row.min_km),
      maxKm: Number(row.max_km),
      charge: Number(row.charge),
    }));
  },

  async getDeliveryAreas() {
    const { data, error } = await supabase.from("delivery_areas").select("*").order("sort_order");
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      charge: Number(row.charge),
    }));
  },

  async submitReview({ orderId, customerId, customerName, rating, comment }) {
    const { error } = await supabase.from("reviews").insert({
      order_id: orderId,
      customer_id: customerId,
      customer_name: customerName,
      rating,
      comment: comment || "",
    });
    if (error) throw error;
  },

  subscribeToOrder(orderId, onUpdate) {
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        async () => {
          const updated = await fetchOrderWithItems(orderId);
          onUpdate(updated);
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
};
