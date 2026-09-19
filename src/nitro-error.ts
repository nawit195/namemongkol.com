export default function (error: any, event: any) {
  console.error("--- CATASTROPHIC NITRO ERROR ---");
  console.error(error);
  if (error && typeof error === "object" && error.stack) {
    console.error(error.stack);
  }
  console.error("--------------------------------");

  if (event && event.node && event.node.res) {
    event.node.res.statusCode = 500;
    event.node.res.setHeader("Content-Type", "application/json");
    event.node.res.end(
      JSON.stringify({
        status: 500,
        unhandled: true,
        message: "HTTPError",
        details: error?.message || String(error),
      }),
    );
  }
}
