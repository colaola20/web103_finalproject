

const decrypt = (encryptedData) => {
    key = Buffer.from(process.env.CSS_SOURCE, process.env.FORMAT).toString("utf-8");
    return privateDecrypt(key,encryptedData);
}

const encrypt = (data) => {
    key = Buffer.from(process.env.JS_SOURCE, process.env.FORMAT).toString("utf-8");
    return publicEncrypt(key,data);
}