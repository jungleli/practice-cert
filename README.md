# 自签名ssl证书生成

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


## 创建ssl证书私钥

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

## 创建ssl证书CSR

```shell
openssl req -new -sha256 -key localhost.key -out localhost.csr
```
> CN 需要和域名保持一致

## 创建域名附加配置文件

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


## 使用CA签署ssl证书

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

## 其它

查看签署的证书信息
openssl x509 -in localhost.crt -noout -text

使用CA验证一下证书是否通过
openssl verify -CAfile ../ca/myCA.crt localhost.crt