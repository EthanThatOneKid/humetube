Deno.serve(async (request) => {
  console.log("Incoming request!");
  const body = await request.json();
  console.log(JSON.stringify(body, null, 2));
  return new Response("OK");
});
