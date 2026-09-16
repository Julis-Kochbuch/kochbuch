const allowedOrigins = [
    `http://${process.env.HOSTNAME!}${process.env.PROXY_PORT ? `:${process.env.PROXY_PORT}` : ``}`,
    `https://${process.env.HOSTNAME!}${process.env.PROXY_PORT ? `:${process.env.PROXY_PORT}` : ``}`
];

export default allowedOrigins;