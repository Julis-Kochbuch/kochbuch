const allowedOrigins = [
    `http://${process.env.HOSTNAME!}${process.env.HTTP_PROXY_PORT ? `:${process.env.HTTP_PROXY_PORT}` : ``}`,
    `https://${process.env.HOSTNAME!}${process.env.HTTPS_PROXY_PORT ? `:${process.env.HTTPS_PROXY_PORT}` : ``}`
];

export default allowedOrigins;