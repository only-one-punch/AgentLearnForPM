import http from "node:http";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const paths = [`${basePath}/api/health`, `${basePath}/login`];

function check(path) {
  return new Promise((resolve) => {
    const request = http.get(
      {
        hostname: "127.0.0.1",
        port: Number(process.env.PORT || 3000),
        path,
        timeout: 4000,
      },
      (response) => {
        response.resume();
        resolve(response.statusCode ? response.statusCode < 500 : false);
      },
    );

    request.on("error", () => resolve(false));
    request.on("timeout", () => {
      request.destroy();
      resolve(false);
    });
  });
}

for (const path of paths) {
  if (await check(path)) {
    process.exit(0);
  }
}

process.exit(1);
