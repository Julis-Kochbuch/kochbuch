const allowedOrigins = [
    `http://${process.env.HOSTNAME!}`,
    `https://${process.env.HOSTNAME!}`
];

export default allowedOrigins;