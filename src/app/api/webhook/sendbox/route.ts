import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const event = body.event || body.type || body.action;
    const shipment = body.shipment || body.data || body;

    console.log("Sendbox webhook received:", {
      event,
      tracking_number: shipment.tracking_number || shipment.trackingNumber,
      status: shipment.status || shipment.shipment_status,
      timestamp: new Date().toISOString(),
    });

    // Handle different event types
    switch (event) {
      case "shipment.created":
        console.log("Shipment created:", shipment.tracking_number);
        break;

      case "shipment.in_transit":
      case "shipment picked up":
        console.log("Shipment in transit:", shipment.tracking_number);
        break;

      case "shipment.delivered":
        console.log("Shipment delivered:", shipment.tracking_number);
        break;

      case "shipment.failed":
      case "shipment.returned":
        console.log("Shipment issue:", shipment.tracking_number, event);
        break;

      default:
        console.log("Unhandled Sendbox event:", event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Sendbox webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Sendbox webhook endpoint is active" });
}
