[Red Hat 单点登录](https://www.redhat.com/en/products/middleware)(SSO) — 或其开源版本 Keycloak — 是 Web SSO 功能的领先产品之一，它基于流行的标准，例如安全断言标记语言 (SAML) 2.0、OpenID Connect 和 OAuth 2.0。Red Hat SSO 最强大的功能之一是我们可以通过多种方式直接访问 Keycloak，无论是通过简单的 HTML 登录表单，还是通过 API 调用。在以下场景中，我们将生成一个 JWT 令牌，然后对其进行验证。一切都将使用 API 调用来完成，因此 Keycloak 的 UI 不会直接暴露给公众。

设置用户

首先，我们将在 Keycloak 中创建一个简单的用户，如图 1 所示。

![](https://developers.redhat.com/sites/default/files/styles/article_floated/public/blog/2019/12/keycloak01-1.png?itok=WywnX4-4)

图 1：在 Keycloak 中创建用户。">

填写所有必填字段，例如**Username**、**First Name**和**Last Name**，如图 2 所示。

![](https://developers.redhat.com/sites/default/files/styles/article_floated/public/blog/2019/12/keycloak02-1.png?itok=6nuYjWAS)

图 2：输入用户信息。">

设置用户密码，如图 3 所示。

![](https://developers.redhat.com/sites/default/files/styles/article_floated/public/blog/2019/12/keycloak03-1.png?itok=xhzQFM8t)

图 3：设置用户密码。">

# 设置客户端

下一步是在我们的领域中创建一个特定的*客户端*，如图 4 所示。Keycloak 中的客户端代表特定用户可以访问的资源，无论是用于验证用户身份、请求身份信息还是验证访问令牌。

![](https://developers.redhat.com/sites/default/files/styles/article_floated/public/blog/2019/12/keycloak04-1.png?itok=cKzhT2We)

图 4：查看您现有的客户。">

单击**“创建”** ，打开**“添加客户端”**对话框，如图 5 所示。

![](https://developers.redhat.com/sites/default/files/styles/article_floated/public/blog/2019/12/keycloak05-1.png?itok=GQ60hiap)

图 5：创建新客户端。">

填写客户表格中的所有必填字段。请特别注意**Direct Grant Flow**（如图 6 所示）并将其值设置为**direct grant**。此外，将**访问类型**更改为**机密**。

![](https://developers.redhat.com/sites/default/files/styles/article_floated/public/blog/2019/12/keycloak06-1.png?itok=azkV9Cm1)

图 6：覆盖客户端的身份验证流程。">

**最后，将 Client Authenticator**字段中的客户端凭证更改为**Client Id 和 Secret**，如图 7 所示。

![](https://developers.redhat.com/sites/default/files/styles/article_floated/public/blog/2019/12/keycloak07-1.png?itok=3soIf6MC)

图 7：设置新客户的凭据。">

# 测试你的新客户

现在我们可以通过 REST API 来测试我们新创建的客户端来模拟一个简单的登录。我们的身份验证 URL 是

填写参数并使用我们的用户名和密码设置 client_id 和 client_secret：

```shell
curl -L -X POST 'http://localhost:8080/auth/realms/whatever-realm/protocol/openid-connect/token' \
-H 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'client_id=clientid-03' \
--data-urlencode 'grant_type=password' \
--data-urlencode 'client_secret=ec78c6bb-8339-4bed-9b1b-e973d27107dc' \
--data-urlencode 'scope=openid' \
--data-urlencode 'username=emuhamma' \
--data-urlencode 'password=1'
```

或者，我们可以使用 Postman 等 REST API 工具来模拟 HTTP POST 请求，如图 8 所示。

![](https://developers.redhat.com/sites/default/files/styles/article_floated/public/blog/2019/12/keycloak08-1.png?itok=lXBjdXCy)

图 8：我们模拟的 HTTP POST 请求。">

结果将是一个有效的 JWT 令牌：

```json
{
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiAwNjEwLCJpc3MiOiJodHRwO.......wKRTus6PAoHMFlIlYQ75dYiLzzuRMvdXkHl6naLNQ8wYDv4gi7A3eJ163YzXSJf5PmQ",
    "expires_in": 600,
    "refresh_expires_in": 1800,
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cC.......IsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUifQ.ePV2aqeDjlg6ih6SA7_x77gT4JYyv7HvK7PLQW-X1mM",
    " token_type": "bearer",
    "id_token": "eyJhbGciOiJSUz......A_d_LV96VCLBeTJSpqeqpMJYlh4AMJqN6kddtrI4ixZLfwAIj-Qwqn9kzGe-v1-oe80wQXrXzVBG7TJbKm4x5bgCO_B9lnDMrey9 0rvaKKr48K697ug", "
    not-before-policy": 0,
    "session_state": "22c8278b-3346-468e-9533-f41f22ed264f",
    "scope": "openid email profile"
}
```

错误的用户名和密码组合会导致 HTTP 401 响应代码和如下响应正文：

```json
{
    “error”：“invalid_grant”，
    “error_description”：“无效的用户凭证”
}
```

给你。现在您已经配置了一个登录 API，可以很好地与 Keycloak 配合使用。玩得开心！
