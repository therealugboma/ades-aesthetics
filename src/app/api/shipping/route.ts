import { NextRequest, NextResponse } from "next/server";

const SENDBOX_BASE_URL = "https://live.sendbox.co";

interface ShippingRate {
  name: string;
  code: string;
  fee: number;
  delivery_window: string;
  sla_description: string;
  description: string;
  base_fee: number;
  vat: number;
  insurance_fee: number;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.SENDBOX_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Shipping not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { destination, weight, totalValue, items } = body;

    if (!destination?.state || !destination?.city) {
      return NextResponse.json(
        { error: "State and city are required" },
        { status: 400 }
      );
    }

    const payload = {
      origin: {
        first_name: "Ades",
        last_name: "Aesthetics",
        street: "34 Beach Road",
        state: "Lagos",
        city: "Ikorodu",
        country: "NG",
        post_code: "102216",
        phone: "+234 816 469 5802",
        email: "hello@adesaesthetics.com",
      },
      destination: {
        first_name: destination.fullName?.split(" ")[0] || "",
        last_name: destination.fullName?.split(" ").slice(1).join(" ") || "",
        street: destination.streetAddress || "",
        state: destination.state,
        city: destination.lga || destination.state,
        country: "NG",
        post_code: destination.postalCode || "",
        phone: destination.phone || "",
        email: destination.email || "",
      },
      weight: weight || 1,
      dimension: {
        length: 30,
        width: 20,
        height: 10,
      },
      incoming_option: "pickup",
      region: "NG",
      service_type: "local",
      package_type: "general",
      total_value: totalValue || 1000,
      currency: "NGN",
      channel_code: "api",
      pickup_date: new Date().toISOString().split("T")[0],
      items: items?.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        value: item.price,
        weight: 0.5,
      })) || [{
        name: "Beauty Product",
        quantity: 1,
        value: totalValue || 1000,
        weight: 0.5,
      }],
      service_code: "standard",
      customs_option: "sender",
    };

    const response = await fetch(
      `${SENDBOX_BASE_URL}/shipping/shipment_delivery_quote`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apiKey,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Sendbox API error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch shipping rates" },
        { status: response.status }
      );
    }

    const data = await response.json();

    const rates: ShippingRate[] = (data.rates || [])
      .filter((r: any) => r.is_enabled)
      .map((r: any) => ({
        name: r.name,
        code: r.code,
        fee: r.fee,
        delivery_window: r.delivery_window || r.delivery_eta_string || "",
        sla_description: r.sla_description || "",
        description: r.description || r.name,
        base_fee: r.base_fee || 0,
        vat: r.vat || 0,
        insurance_fee: r.insurance_fee || 0,
      }));

    return NextResponse.json({
      rates,
      destination: data.destination,
      currency: data.currency || "NGN",
    });
  } catch (error) {
    console.error("Shipping quote error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
