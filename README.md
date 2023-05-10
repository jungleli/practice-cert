# mTLS模型中 自签名ssl证书生成

## 生成CA私钥

```shell
# 创建私钥
openssl genrsa -des3 -out myCA.key 2048
```

生成如下

```
Generating RSA private key, 2048 bit long modulus
..................................................................................+++
..................................................................................+++
e is 65537 (0x10001)
Enter pass phrase for myCA.key:
Verifying - Enter pass phrase for myCA.key:
```

## 生成CA证书

```shell
openssl req -x509 -new -nodes -key myCA.key -sha256 -days 3600 -out myCA.crt
```


> 把此证书导入需要部署的PC中即可，以后用此CA签署的证书都可以使用
> 查看证书信息命令 openssl x509 -in myCA.crt -noout -text


## 生成server端证书
### 创建ssl证书私钥

```shell
openssl genrsa -out localhost.key 2048
```

输出信息

```
Generating RSA private key, 2048 bit long modulus
..+++
........................................................................................................................................................................................................................................+++
e is 65537 (0x10001)
```

### 创建ssl证书CSR

```shell
openssl req -new -sha256 -key localhost.key -out localhost.csr
```
> CN 需要和域名保持一致

### 创建域名附加配置文件

新建文件`cert.ext` 输入如下内容保存

```ini
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.2 = 127.0.0.1
DNS.3 = test.com
DNS.4 = *.test.com
```


### 使用CA签署ssl证书

```shell
openssl x509 -req -in localhost.csr -out localhost.crt -days 365 \
  -CAcreateserial -CA myCA.crt \
  -CAkey myCA.key \
  -extfile cert.ext -sha256
```

此步骤需要输入CA私钥的密码

```
Signature ok
subject=/C=US/ST=U/L=U/O=u/OU=u/CN=127.0.0.1/emailAddress=jlli@test.com
Getting CA Private Key
Enter pass phrase for myCA.key:
```

### 其它

查看签署的证书信息
openssl x509 -in localhost.crt -noout -text

使用CA验证一下证书是否通过
openssl verify -CAfile ../ca/myCA.crt localhost.crt

## 重复server端证书生成方式，生成client端证书

## 本地配置https server，此处以服务端用node server模拟，client端用curl模拟
代码在server.js中，启动server
```
node server.js
```

模拟client端：

需要指定服务端用于签名的CA证书，用来验证服务端证书的有效性，同样，在服务端需要指定客户端用于签名的证书。
```
curl --cert client.crt --key client.key --cacert myCA.crt  https://localhost:9443
```

