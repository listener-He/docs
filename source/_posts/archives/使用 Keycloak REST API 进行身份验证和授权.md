---
password: ''
icon: ''
date: '2023-04-28T13:13:00.000+08:00'
type: Post
category: 技术分享
urlname: authentication-and-authorization-using-the-keycloak-rest-api
catalog:
  - archives
tags:
  - 开发
  - 建站
  - Java
  - oauth
  - keycloak
summary: >-
  Keycloak REST API
  可以被用来进行身份验证和授权。使用该API，开发人员可以轻松地在其应用程序中实现安全性验证和授权功能，同时使用Keycloak的内置功能进行管理和配置。Keycloak的REST
  API还提供了许多不同的终端点来进行用户和角色管理、认证事件和SAML元数据的访问等。 作为一个基于开源的身份和访问管理解决方案，Keycloak的REST
  API对于任何需要对应用程序进行认证和授权的开发人员都非常有帮助。
sort: ''
title: 使用 Keycloak REST API 进行身份验证和授权
status: Published
cover: >-
  https://www.keycloak.org/docs/latest/authorization_services/images/getting-started/hello-world/create-realm.png
updated: '2023-10-08 14:42:00'
abbrlink: 33923
---

启用身份验证和授权涉及复杂的功能，而不仅仅是简单的登录 API。[在之前的文章（使用 Keycloak 的 API 登录和 JWT 令牌生成）中](https://blog.hehouhui.cn/archives/api-login-and-jwt-token-generation-using-keycloak)，我描述了 Keycloak REST 登录 API 端点，它只处理一些身份验证任务。在本文中，我描述了如何使用开箱即用的 Keycloak REST API 功能启用身份验证和授权的其他方面。

# 身份验证与授权

但首先，身份验证和授权之间有什么区别？简单地说，身份验证意味着*你是谁*，而授权意味着*你可以做什么*，每种方法都使用不同的方法进行验证。例如，身份验证使用用户管理和登录表单，授权使用基于角色的访问控制 (RBAC) 或访问控制列表 (ACL)。幸运的是，这些验证方法在 Red Hat 的单点登录 (SSO) 工具中提供，或者在他们的上游开源项目 Keycloak 的 REST API 中提供。

# Keycloak SSO 案例研究

为了更好地理解使用 Keycloak 进行身份验证和授权，让我们从一个简单的案例研究开始。假设印度尼西亚教育部计划创建与多所学校的单点登录集成。他们计划使用集中式平台在多个学校维护学生和教师的单一帐户 ID。这让每个用户都具有相同的角色，但在每所学校具有不同的访问权限和特权，如图 1 所示。

![keycloak-education-00.png](https://developers.redhat.com/sites/default/files/styles/article_floated/public/blog/2020/08/keycloak-education-00.png?itok=aKKqoLgU)

图 1：每个用户都可以使用相同的角色，但在每所学校具有不同的访问权限和权限。">

# Keycloak SSO 演示

让我们通过创建一个 Keycloak 领域来开始演示。为该部门使用 Add realm 对话框（如图 2 所示）。为领域命名`education`，将**Enabled**设置为**ON**，然后单击**Create**。

![keycloak-education-01.png](https://developers.redhat.com/sites/default/files/styles/article_floated/public/blog/2020/08/keycloak-education-01.png?itok=TFFotz_T)

图 2：为教育部创建名为“教育”的 Keycloak 领域。">

接下来，转到 Roles 页面并确保选择了**Realm Roles**选项卡，如图 3 所示。

![keycloak-education-06.png](https://developers.redhat.com/sites/default/files/styles/article_floated/public/blog/2020/08/keycloak-education-06.png?itok=kN1XyC0P)

图 3：为教育领域创建两个独立的角色：教师和学生。

单击**添加角色**为该领域创建两个单独的角色，称为“教师”和“学生”。然后，这些新角色将出现在**Realm Roles**选项卡中，如图 4 所示。

![keycloak-education-07.png](https://developers.redhat.com/sites/default/files/styles/article_floated/public/blog/2020/08/keycloak-education-07.png?itok=KBPu-x5E)

图 4：添加教师和学生角色。">

然后，使用 Clients 页面，单击**Create**添加客户端，如图 5 所示。

![keycloak-education-02.png](https://developers.redhat.com/sites/default/files/styles/article_floated/public/blog/2020/08/keycloak-education-02.png?itok=_XcRiyxZ)

图 5：添加客户端。

在 Add Client 页面上，创建一个名为“jakarta-school”的客户端，然后单击**Save**添加该客户端，如图 6 所示。

![keycloak-education-03.png](https://developers.redhat.com/sites/default/files/styles/article_floated/public/blog/2020/08/keycloak-education-03.png?itok=ioRUgKYl)

在 jakarta-school 详细信息页面上，转到**“设置”**选项卡并输入以下客户端配置，如图 7 所示：

- **客户 ID**

  : jakarta-school

- **启用**

  ：开

- **需要同意**

  ：关闭

- **客户端协议**

  ：openid-connect

- **访问类型**

  ：机密

- **启用标准流量**

  ：开

- **启用影响流**

  ：关闭

- **已启用直接访问授权**

  ：ON

![keycloak-education-04.png](https://developers.redhat.com/sites/default/files/styles/article_floated/public/blog/2020/08/keycloak-education-04.png?itok=UAhXaIL2)

图 7：在 jakarta-school 详细信息页面上，输入客户端配置。

在同一页面的底部，在 Authentication Flow Overrides 部分，我们可以设置如下，如图 8 所示：

- **浏览器流程**

  ：浏览器

- **直接拨款流程**

  ：直接拨款

![keycloak-education-05.png](https://developers.redhat.com/sites/default/files/styles/article_floated/public/blog/2020/08/keycloak-education-05.png?itok=bjT_1W98)

图 8：配置身份验证流程覆盖。">

转到**Roles**选项卡，单击**Add Role**，然后为此客户端创建 create-student-grade、view-student-grade 和 view-student-profile 角色，如图 9 所示。每个角色都应设置为 Composite **False**。

![keycloak-education-11.png](https://developers.redhat.com/sites/default/files/styles/article_floated/public/blog/2020/08/keycloak-education-11.png?itok=MySy1CkW)

图 9：为此客户创建角色。

接下来，转到**Client Scopes**选项卡，在**Default Client Scopes**部分中，将“roles”和“profile”添加到**Assigned Default Client Scopes**中，如图 10 所示。

![keycloak-education-08.png](https://developers.redhat.com/sites/default/files/styles/article_floated/public/blog/2020/08/keycloak-education-08.png?itok=EQBlb8Yo)

图 10：设置客户端范围。

在 jakarta-school 详情页面，选择**Mappers**，然后选择**Create Protocol Mappers**，设置 mappers 在 Userinfo API 上显示客户端角色，如图 11 所示：

- **名称**

  ：角色

- **映射器类型**

  ：用户领域角色

- **多值**

  ：开

- **令牌声明名称**

  ：角色

- **声明 JSON 类型**

  ：字符串

- **添加到 ID 令牌**

  ：关闭

- **添加到访问令牌**

  ：关闭

- **添加到用户信息**

  ：ON

![keycloak-education-09.png](https://developers.redhat.com/sites/default/files/styles/article_floated/public/blog/2020/08/keycloak-education-09.png?itok=zZAbM6Sr)

图 11：设置映射器以显示客户端角色。

接下来，转到**Users**页面，选择**Add user**，创建新用户，然后单击**Save，**如图 12 所示：

- **用户名**

  ：埃德温

- **电子邮件**

  ：edwin@redhat.com

- **名字**

  ：埃德温

- **姓**

  : M

- **用户启用**

  ：ON

- **电子邮件已验证**

  ：关闭

![keycloak-education-10.png](https://developers.redhat.com/sites/default/files/styles/article_floated/public/blog/2020/08/keycloak-education-10.png?itok=rOzI0tsb)

图 12：创建新用户。

最后，在**Role Mappings**选项卡中，为 jakarta-school 中的每个用户选择**Client Roles**，如图 13 所示。它们应该是 create-student-grade、view-student-grade 和 view-student-profile。

![keycloak-education-12.png](https://developers.redhat.com/sites/default/files/styles/article_floated/public/blog/2020/08/keycloak-education-12.png?itok=3QIR03u9)

图 13：为 jakarta-school 中的每个用户选择客户端角色。

我的 Keycloak 配置演示到此结束。

# 使用 Java 应用程序的 Keycloak 连接

现在我想演示如何开发一个非常简单的 Java 应用程序。此应用程序连接到您的 Keycloak 实例，并通过其 REST API 使用 Keycloak 的身份验证和授权功能。

首先，从 pom.xml 文件开始开发 Java 应用程序，如以下示例所示：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>EducationService</groupId>
    <artifactId>com.edw</artifactId>
    <version>1.0-SNAPSHOT</version>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.2.1.RELEASE</version>
        <relativePath/>
    </parent>

    <properties>
        <java.version>11</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>com.auth0</groupId>
            <artifactId>jwks-rsa</artifactId>
            <version>0.12.0</version>
        </dependency>

        <dependency>
            <groupId>com.auth0</groupId>
            <artifactId>java-jwt</artifactId>
            <version>3.8.3</version>
        </dependency>

    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>
```

Java 应用程序还要求您开发一个简单的属性文件：

```yaml
server:
  error:
    whitelabel: enabled:false
  port: 8082
spring:
  mvc:
    favicon: enabled:false
keycloak:
  client-id: jakarta-school
  client-secret: 197bc3b4-64b0-452f-9bdb-fcaea0988e90
  scope: openid, profile
  authorization-grant-type: password
  authorization-uri: http://localhost:8080/auth/realms/education/protocol/openid-connect/auth
  user-info-uri: http://localhost:8080/auth/realms/education/protocol/openid-connect/userinfo
  token-uri: http://localhost:8080/auth/realms/education/protocol/openid-connect/token
  logout: http://localhost:8080/auth/realms/education/protocol/openid-connect/logout
  jwk-set-uri: http://localhost:8080/auth/realms/education/protocol/openid-connect/certs
  certs-id: vdaec4Br3ZnRFtZN-pimK9v1eGd3gL2MHu8rQ6M5SiE
logging:
  level:
    root: INFO
```

接下来，从图 14 所示的表单中获取 Keycloak 证书 ID。

![keycloak-education-13.png](https://developers.redhat.com/sites/default/files/styles/article_floated/public/blog/2020/11/keycloak-education-13.png?itok=KkNUCm4W)

图 14：找到 Keycloak 证书 ID。

之后，最重要的是，您的下一个任务是开发集成代码；此操作涉及多个 Keycloak API。请注意，我没有详细介绍 Keycloak 登录 API，因为它已经在我之前的文章中进行了描述。

从一个简单的注销 API 开始：

```java
    @Value("${keycloak.logout}")
    private String keycloakLogout;

    public void logout(String refreshToken) throws Exception {
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("client_id",clientId);
        map.add("client_secret",clientSecret);
        map.add("refresh_token",refreshToken);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, null);
        restTemplate.postForObject(keycloakLogout, request, String.class);
    }
```

首先，我想指出，对于注销，使用参数`refresh_token`而不是是至关重要的`access_token`。现在，使用 API 检查不记名令牌是否有效和活跃，以验证请求是否带来有效凭证。

```java
    @Value("${keycloak.user-info-uri}")
    private String keycloakUserInfo;

    private String getUserInfo(String token) {
        MultiValueMap<String, String> headers = new LinkedMultiValueMap<>();
        headers.add("Authorization", token);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(null, headers);
        return restTemplate.postForObject(keycloakUserInfo, request, String.class);
    }
```

对于授权，您可以使用两种方法来决定给定角色是否有资格访问特定 API。第一种方法是通过针对 Keycloak 的 userinfo API 进行验证来确定不记名令牌带来的角色，下一个方法是验证不记名令牌中的角色。

对于第一种方法，您可以期待 Keycloak 的以下响应：

```json
{
  "sub": "ef2cbe43-9748-40e5-aed9-fe981e3082d5",
  "roles": ["teacher"],
  "name": "Edwin M",
  "preferred_username": "edwin",
  "given_name": "Edwin ",
  "family_name": "M"
}
```

如您所见，那里有一个`roles`标签，一种方法是根据它来验证访问权限。缺点是每个请求在您的应用程序和 Keycloak 之间有多次往返请求，这会导致更高的延迟。

另一种方法是读取通过每个请求发送的 JWT 令牌的内容。为了成功解码您的 JWT 令牌，您必须知道用于对其签名的公钥。这就是 Keycloak 提供 JWKS 端点的原因。您可以使用 curl 命令查看其内容，如以下示例所示：

```json
{
  "keys": [
    {
      "kid": "vdaec4Br3ZnRFtZN-pimK9v1eGd3gL2MHu8rQ6M5SiE",
      "kty": "RSA",
      "alg": "RS256",
      "use": "sig",
      "n": "4OPCc_LDhU6ADQj7cEgRei4VUf4PZH8GYsxsR6RSdeKmDvZ48hCSEFiEgfc3FIfh-gC4r9PtKucc_nkRofrAKR4qL8KNNoSuzQAOC92Yz6r7Ao4HppHJ8-QVdo5H-d9wfNSlDLBSo5My4b4EnHb1HLuFxDqyhFpGvsoUJdgbt3m_Q3WAVb2yrM83S6HX__vrQvqUk2e7z5RNrI7LSsW3ZOz9fU7pvm8-kFFAIPJ7fOJIC7UQ9wBWg3YdwQ0B2b24jXjVr0QCGzqJ6o1G_UZYSJCDMGQDpDcEuYnvSKBLfVR-0EcAjolRhcSPjHlW0Cp0YU8qwWDHpjkbrMrFmxlO4Q",
      "e": "AQAB"
    }
  ]
}
```

请注意，在前面的示例中，kid 代表 key id，alg 代表加密算法，n 代表用于此领域的公钥。您可以使用此公钥轻松解码我们的 JWT 令牌，并从 JWT 声明中读取 roles。下面显示了解码后的样本 JWT 令牌：

```json
{
  "jti": "85edca8c-a4a6-4a4c-b8c0-356043e7ba7d",
  "exp": 1598079154,
  "nbf": 0,
  "iat": 1598078854,
  "iss": "http://localhost:8080/auth/realms/education",
  "sub": "ef2cbe43-9748-40e5-aed9-fe981e3082d5",
  "typ": "Bearer",
  "azp": "jakarta-school",
  "auth_time": 0,
  "session_state": "f8ab78f8-15ee-403d-8db7-7052a8647c65",
  "acr": "1",
  "realm_access": {
    "roles": ["teacher"]
  },
  "resource_access": {
    "jakarta-school": {
      "roles": [
        "create-student-grade",
        "view-student-profile",
        "view-student-grade"
      ]
    }
  },
  "scope": "profile",
  "name": "Edwin M",
  "preferred_username": "edwin",
  "given_name": "Edwin",
  "family_name": "M"
}
```

您可以使用以下示例中显示的代码读取角色标签：

```java
   @GetMapping("/teacher")
    public HashMap teacher(@RequestHeader("Authorization") String authHeader) {
        try {
            DecodedJWT jwt = JWT.decode(authHeader.replace("Bearer", "").trim());

            // check JWT is valid
            Jwk jwk = jwtService.getJwk();
            Algorithm algorithm = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);

            algorithm.verify(jwt);

            // check JWT role is correct
            List<String> roles = ((List)jwt.getClaim("realm_access").asMap().get("roles"));
            if(!roles.contains("teacher"))
                throw new Exception("not a teacher role");

            // check JWT is still active
            Date expiryDate = jwt.getExpiresAt();
            if(expiryDate.before(new Date()))
                throw new Exception("token is expired");

            // all validation passed
            return new HashMap() {{
                put("role", "teacher");
            }};
        } catch (Exception e) {
            logger.error("exception : {} ", e.getMessage());
            return new HashMap() {{
                put("status", "forbidden");
            }};
        }
    }
```

这种方法最好的部分是您可以将来自 Keycloak 的公钥放在缓存中，从而减少往返请求，这种做法最终会增加应用程序延迟和性能。[可以在我的 GitHub 存储库中](https://github.com/edwin/java-keycloak-integration)找到本文的完整代码。

# 结论

总之，我准备这篇文章首先是为了解释启用身份验证和授权涉及复杂的功能，而不仅仅是一个简单的登录 API。然后我演示了如何使用开箱即用的 Keycloak REST API 功能启用身份验证和授权的许多方面。

此外，我还演示了如何开发一个连接到您的 Keycloak 实例的简单 Java 应用程序，并通过其 REST API 使用 Keycloak 的身份验证和授权功能。
