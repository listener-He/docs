---
password: ""
icon: ""
date: "2023-04-28"
type: Post
category: 技术分享
urlname: keycloak-client-oauth-guide
catalog:
  - archives
tags:
  - 建站
  - keycloak
  - oauth
summary: ""
sort: ""
title: Keycloak 客户端授权服务
status: Published
cover: "https://cdn.jsdelivr.net/gh/listener-He/images@default/202305102206180.png"
updated: "2023-11-02 16:24:00"
---

## **授权服务概述**

[编辑本节](https://github.com/keycloak/keycloak/tree/main/docs/documentation/authorization_services/topics/auth-services-overview.adoc)[报告问题](https://issues.redhat.com/secure/CreateIssueDetails!init.jspa?pid=12313920&components=12323375&issuetype=1&priority=3&description=File%3A%20authorization_services%2Ftopics%2Fauth-services-overview.adoc)

Keycloak 支持细粒度的授权策略，并能够结合不同的访问控制机制，例如：

- **基于属性的访问控制 (ABAC)**
- **基于角色的访问控制 (RBAC)**
- **基于用户的访问控制 (UBAC)**
- **基于上下文的访问控制 (CBAC)**
- **基于规则的访问控制**
  - 使用 JavaScript
- **基于时间的访问控制**
- **通过服务提供商接口 (SPI) 支持自定义访问控制机制 (ACM)**

Keycloak 基于一组管理 UI 和 RESTful API，并提供必要的方法来为您的受保护资源和范围创建权限，将这些权限与授权策略相关联，并在您的应用程序和服务中执行授权决策。

资源服务器（服务于受保护资源的应用程序或服务）通常依靠某种信息来决定是否应授予对受保护资源的访问权限。对于基于 RESTful 的资源服务器，该信息通常是从安全令牌中获取的，通常在每次向服务器发出请求时作为承载令牌发送。对于依赖会话来验证用户身份的 Web 应用程序，该信息通常存储在用户的会话中，并从那里为每个请求检索。

通常，资源服务器仅根据基于角色的访问控制 (RBAC) 执行授权决策，其中根据映射到这些相同资源的角色检查授予试图访问受保护资源的用户的角色。虽然角色非常有用并被应用程序使用，但它们也有一些限制：

- 资源和角色紧密耦合，角色的更改（例如添加、删除或更改访问上下文）会影响多个资源
- 对安全要求的更改可能意味着对应用程序代码进行深入更改以反映这些更改
- 根据您的应用程序大小，角色管理可能会变得困难且容易出错
- 它不是最灵活的访问控制机制。角色不代表您是谁，并且缺乏上下文信息。如果您被授予了一个角色，那么您至少拥有一些访问权限。

考虑到今天我们需要考虑用户分布在不同地域、本地策略不同、使用不同设备、信息共享需求高的异构环境，Keycloak 授权服务可以帮助您提升应用和服务的授权能力通过提供：

- 使用细粒度授权策略和不同访问控制机制的资源保护
- 集中的资源、权限和策略管理
- 中央政策决策点
- 基于一组基于 REST 的授权服务的 REST 安全性
- 授权工作流和用户管理的访问
- 有助于避免跨项目（和重新部署）代码复制并快速适应安全需求变化的基础设施。

![authz-arch-overview.png](https://www.keycloak.org/docs/latest/authorization_services/images/authz-arch-overview.png)

从设计的角度来看，授权服务基于一组定义良好的授权模式，提供以下功能：

- **策略管理点 (PAP)**

  提供一组基于 Keycloak 管理控制台的 UI，用于管理资源服务器、资源、范围、权限和策略。其中一部分也通过使用[Protection API](https://www.keycloak.org/docs/latest/authorization_services/index.html#_service_protection_api)远程完成。

- **政策决策点 (PDP)**

  提供一个可分发的策略决策点，指向发送授权请求的位置，并根据请求的权限相应地评估策略。有关详细信息，请参阅[获取权限](https://www.keycloak.org/docs/latest/authorization_services/index.html#_service_obtaining_permissions)。

- **策略执行点 (PEP)**

  为不同环境提供实现，以在资源服务器端实际执行授权决策。Keycloak 提供了一些内置的[Policy Enforcer](https://www.keycloak.org/docs/latest/authorization_services/index.html#_enforcer_overview)。

- **政策信息点 (PIP)**

  基于 Keycloak Authentication Server，您可以在授权策略评估期间从身份和运行环境中获取属性。

### **授权流程**

三个主要流程定义了必要的步骤，以了解如何使用 Keycloak 为您的应用程序启用细粒度授权：

- **资源管理**
- **权限和策略管理**
- **政策执行**

### **资源管理**

**资源管理**涉及定义受保护内容的所有必要步骤。

![resource-mgmt-process.png](https://www.keycloak.org/docs/latest/authorization_services/images/resource-mgmt-process.png)

首先，您需要指定 Keycloak 您希望保护什么，这通常代表一个 Web 应用程序或一组一个或多个服务。有关资源服务器的更多信息，请参阅[术语](https://www.keycloak.org/docs/latest/authorization_services/index.html#_overview_terminology)。

资源服务器使用 Keycloak 管理控制台进行管理。您可以在那里启用任何已注册的客户端应用程序作为资源服务器，并开始管理您要保护的资源和范围。

![rs-r-scopes.png](https://www.keycloak.org/docs/latest/authorization_services/images/rs-r-scopes.png)

资源可以是网页、RESTFul 资源、文件系统中的文件、EJB 等等。它们可以代表一组资源（就像 Java 中的类），也可以代表单个特定资源。

例如，您可能拥有代表所有银行账户的*银行账户*资源，并使用它来定义所有银行账户通用的授权策略。但是，您可能希望为*Alice 帐户*（属于客户的资源实例）定义特定策略，其中仅允许所有者访问某些信息或执行操作。

可以使用 Keycloak 管理控制台或[Protection API](https://www.keycloak.org/docs/latest/authorization_services/index.html#_service_protection_api)来管理资源。在后一种情况下，资源服务器能够远程管理它们的资源。

范围通常表示可以对资源执行的操作，但不限于此。您还可以使用范围来表示资源中的一个或多个属性。

### **权限和策略管理**

一旦定义了资源服务器和所有要保护的资源，就必须设置权限和策略。

此过程涉及实际定义管理资源的安全和访问要求的所有必要步骤。

![policy-mgmt-process.png](https://www.keycloak.org/docs/latest/authorization_services/images/policy-mgmt-process.png)

策略定义了访问某物（资源或范围）或对其执行操作所必须满足的条件，但它们与所保护的内容无关。它们是通用的，可以重复用于构建权限或什至更复杂的策略。

例如，要仅允许具有“高级用户”角色的用户访问一组资源，您可以使用 RBAC（基于角色的访问控制）。

Keycloak 提供了一些内置的策略类型（及其各自的策略提供者），涵盖了最常见的访问控制机制。您甚至可以根据使用 JavaScript 编写的规则创建策略。

一旦您定义了策略，您就可以开始定义您的权限。权限与它们所保护的资源相结合。您可以在此处指定要保护的内容（资源或范围）以及授予或拒绝权限必须满足的策略。

### **政策执行**

**策略执行**涉及必要的步骤，以实际执行对资源服务器的授权决策。**这是通过在资源服务器上启用策略执行点**或 PEP 来实现的，该资源服务器能够与授权服务器通信，请求授权数据并根据服务器返回的决策和权限控制对受保护资源的访问。

![pep-pattern-diagram.png](https://www.keycloak.org/docs/latest/authorization_services/images/pep-pattern-diagram.png)

Keycloak 提供了一些内置的[Policy Enforcer](https://www.keycloak.org/docs/latest/authorization_services/index.html#_enforcer_overview)实现，您可以使用它们来保护您的应用程序，具体取决于它们运行的平台。

### **授权服务**

授权服务由以下 RESTFul 端点组成：

- **令牌端点**
- **资源管理端点**
- **权限管理端点**

这些服务中的每一个都提供一个特定的 API，涵盖授权过程中涉及的不同步骤。

### **令牌端点**

OAuth2 客户端（例如前端应用程序）可以使用令牌端点从服务器获取访问令牌，并使用这些相同的令牌访问受资源服务器保护的资源（例如后端服务）。同样，Keycloak 授权服务为 OAuth2 提供扩展，以允许根据与所请求的资源或范围关联的所有策略的处理来发布访问令牌。这意味着资源服务器可以根据服务器授予并由访问令牌持有的权限强制访问其受保护的资源。在 Keycloak 授权服务中，具有权限的访问令牌称为请求方令牌或简称 RPT。

额外资源

- [获取权限](https://www.keycloak.org/docs/latest/authorization_services/index.html#_service_obtaining_permissions)

### **保护 API**

Protection **API**是一组[符合 UMA 的](https://docs.kantarainitiative.org/uma/wg/oauth-uma-federated-authz-2.0-09.html)端点，为资源服务器提供操作，以帮助它们管理与它们相关的资源、范围、权限和策略。仅允许资源服务器访问此 API，这也需要一个  **uma_protection**范围。

Protection API 提供的操作可以分为两大类：

- **资源管理**
  - 创建资源
  - 删除资源
  - 按 ID 查找
  - 询问
- **权限管理**
  - 签发许可票

|     | 默认情况下，远程资源管理处于启用状态。您可以使用 Keycloak 管理控制台更改它，并且只允许通过控制台进行资源管理。 |
| --- | -------------------------------------------------------------------------------------------------------------- |

在使用 UMA 协议时，Protection API 签发 Permission Tickets 是整个授权流程的重要环节。如后续部分所述，它们表示客户端请求的权限，这些权限被发送到服务器以获得最终令牌，其中包含在评估与请求的资源和范围关联的权限和策略期间授予的所有权限。

额外资源

- [保护 API](https://www.keycloak.org/docs/latest/authorization_services/index.html#_service_protection_api)

### **术语**

在继续之前，了解 Keycloak 授权服务引入的这些术语和概念很重要。

### **资源服务器**

根据 OAuth2 术语，资源服务器是托管受保护资源并能够接受和响应受保护资源请求的服务器。

资源服务器通常依靠某种信息来决定是否应该授予对受保护资源的访问权限。对于基于 RESTful 的资源服务器，该信息通常在安全令牌中携带，通常作为不记名令牌与每个请求一起发送到服务器。依赖会话来验证用户身份的 Web 应用程序通常将该信息存储在用户的会话中，并从那里为每个请求检索它。

在 Keycloak 中，任何**机密的**客户端应用程序都可以充当资源服务器。此客户端的资源及其各自的范围受一组授权策略的保护和管理。

### **资源**

资源是应用程序和组织资产的一部分。它可以是一组一个或多个端点，一个经典的网络资源，如 HTML 页面，等等。在授权策略术语中，资源是受保护的*对象*。

每个资源都有一个唯一标识符，可以表示单个资源或一组资源。例如，您可以管理一个*银行账户资源*，它代表并定义了一组适用于所有银行账户的授权策略。但是您也可以拥有一个名为*Alice's Banking Account*的不同资源，它代表单个客户拥有的单个资源，它可以有自己的一组授权策略。

### **范围**

资源的范围是可以对资源执行的访问的有界范围。在授权策略术语中，范围是逻辑上可应用于资源的潜在许多*动词*之一。

它通常指示可以使用给定资源做什么。范围的示例有查看、编辑、删除等。但是，范围也可以与资源提供的特定信息相关。在这种情况下，您可以拥有项目资源和成本范围，其中成本范围用于定义用户访问项目成本的特定策略和权限。

### **允许**

考虑这个简单且非常常见的权限：

权限将受保护的对象与必须评估以确定是否授予访问权限的策略相关联。

- **X**可以对资源**Z 做\*\***Y\*\*
  - 哪里……
    - **X**代表一个或多个用户、角色或组，或它们的组合。您还可以在此处使用声明和上下文。
    - **Y**表示要执行的操作，例如写入、查看等。
    - **Z**表示受保护的资源，例如“/accounts”。

Keycloak 提供了一个丰富的平台，用于构建从简单到非常复杂的基于规则的动态权限的一系列权限策略。它提供了灵活性并有助于：

- 降低代码重构和权限管理成本
- 支持更灵活的安全模型，帮助您轻松适应安全需求的变化
- 在运行时进行更改；应用程序只关心受保护的资源和范围，而不关心如何保护它们。

### **政策**

策略定义了授予对象访问权限所必须满足的条件。与权限不同，您不指定受保护的对象，而是指定访问给定对象（例如，资源、范围或两者）必须满足的条件。策略与可用于保护资源的不同访问控制机制 (ACM) 密切相关。借助策略，您可以实施基于属性的访问控制 (ABAC)、基于角色的访问控制 (RBAC)、基于上下文的访问控制或它们的任意组合的策略。

Keycloak 通过提供聚合策略的概念来利用策略的概念以及您如何定义它们，您可以在其中构建“策略的策略”并仍然控制评估的行为。Keycloak 授权服务中的策略实现遵循分而治之技术，而不是编写一个包含访问给定资源必须满足的所有条件的大型策略。也就是说，您可以创建单独的策略，然后以不同的权限重复使用它们，并通过组合单独的策略来构建更复杂的策略。

### **政策提供者**

策略提供者是特定策略类型的实现。Keycloak 提供内置策略，由相应的策略提供者支持，您可以创建自己的策略类型来支持您的特定要求。

Keycloak 提供了一个 SPI（服务提供者接口），您可以使用它来插入您自己的策略提供者实现。

### **许可票**

权限票证是由用户管理的访问 (UMA) 规范定义的一种特殊类型的令牌，它提供了一种不透明的结构，其形式由授权服务器确定。此结构表示客户端请求的资源和/或范围、访问上下文以及必须应用于授权数据请求（请求方令牌 [RPT]）的策略。

在 UMA 中，许可票证对于支持个人对个人共享以及个人对组织共享至关重要。将权限票证用于授权工作流可以实现从简单到复杂的一系列场景，在这些场景中，资源所有者和资源服务器可以根据管理对这些资源的访问的细粒度策略来完全控制他们的资源。

在 UMA 工作流中，权限票证由授权服务器颁发给资源服务器，资源服务器将权限票证返回给试图访问受保护资源的客户端。客户端收到票证后，可以通过将票证发送回授权服务器来请求 RPT（持有授权数据的最终令牌）。

有关权限票证的更多信息，请参阅[用户管理的访问](https://www.keycloak.org/docs/latest/authorization_services/index.html#_service_user_managed_access)和[UMA](https://docs.kantarainitiative.org/uma/wg/oauth-uma-grant-2.0-09.html)规范。

## **入门**

在使用本教程之前，您需要完成 Keycloak 的安装并创建初始管理员用户，如[入门指南](https://www.keycloak.org/guides#getting-started)教程中所示。对此有一个警告。您必须在与 Keycloak 服务器相同的机器上运行一个单独的 WildFly 实例。这个单独的实例将运行您的 Java Servlet 应用程序。因此，您必须在不同的端口下运行 Keycloak，以便在同一台机器上运行时不会出现端口冲突。`jboss.socket.binding.port-offset`在命令行上使用系统属性。此属性的值是一个数字，将添加到 Keycloak 服务器打开的每个端口的基值中。

启动 Keycloak 服务器：

Linux/Unix

```shell
$ .../bin/kc.sh start-dev --http-port 8180
```

视窗

```shell
> ...\bin\kc.bat start-dev --http-port 8180
```

安装并启动两台服务器后，您应该能够通过[http://localhost:8180/auth/admin/访问 Keycloak 管理控制台，也可以通过](http://localhost:8180/auth/admin/)[http://localhost:8080 访问](http://localhost:8080/)WildFly 实例  。

额外资源

- 有关安装和配置 WildFly 实例的更多详细信息，请参阅[保护应用程序和服务指南](https://www.keycloak.org/docs/21.1/securing_apps/)。

### **保护 servlet 应用程序**

本入门指南的目的是让您尽快启动并运行，以便您可以试验和测试 Keycloak 提供的各种授权功能。此快速浏览在很大程度上依赖于默认数据库和服务器配置，并且不涵盖复杂的部署选项。有关功能或配置选项的更多信息，请参阅本文档中的相应部分。

本指南解释了有关 Keycloak 授权服务的关键概念：

- 为客户端应用程序启用细粒度授权
- 将客户端应用程序配置为具有受保护资源的资源服务器
- 定义权限和授权策略以管理对受保护资源的访问
- 在您的应用程序中启用策略实施。

### **创建领域和用户**

本教程的第一步是创建一个领域和该领域中的一个用户。然后，在领域内，我们将创建一个单一的客户端应用程序，然后成为您需要为其启用授权服务的[资源服务器。](https://www.keycloak.org/docs/latest/authorization_services/index.html#_overview_terminology)

程序

1. 创建一个名为**hello-world-authz 的**领域。创建完成后，会显示类似下图的页面：

   领域 hello-world-authz

   ![create-realm.png](https://www.keycloak.org/docs/latest/authorization_services/images/getting-started/hello-world/create-realm.png)

2. 单击**用户**。

   用户列表页面显示您可以在其中创建用户。

3. 单击**创建用户**。
4. 完成**用户名**、**电子邮件**、**名字**和**姓氏**字段。
5. 将**用户启用**切换为**ON**。
6. 单击**创建**。

   添加用户

   ![create-user.png](https://www.keycloak.org/docs/latest/authorization_services/images/getting-started/hello-world/create-user.png)

7. **通过单击“凭据”**选项卡为用户设置密码。

   设置用户密码

   ![reset-user-pwd.png](https://www.keycloak.org/docs/latest/authorization_services/images/getting-started/hello-world/reset-user-pwd.png)

8. 完成**New Password**和**Password Confirmation**字段并将**Temporary**切换为**OFF**。
9. 单击**保存**。
10. 单击**保存密码**。

### **启用授权服务**

您可以在配置为使用 OpenID Connect 协议的现有客户端应用程序中启用授权服务。您还可以使用以下过程创建客户端。

程序

1. 单击菜单中的**客户端。**
2. 填写**客户端类型**。
3. 单击**下一步**。
4. **将客户端身份验证**切换为**ON**。
5. **将授权**切换为**ON**。
6. 单击**保存**。
7. 向下滚动到**功能配置**部分。
8. 填写**根 URL**字段。
9. 单击**保存**。

   创建客户端应用程序

   ![create-client.png](https://www.keycloak.org/docs/latest/authorization_services/images/getting-started/hello-world/create-client.png)

   将为客户端显示一个新的**授权选项卡。**

   客户端设置

   ![enable-authz.png](https://www.keycloak.org/docs/latest/authorization_services/images/getting-started/hello-world/enable-authz.png)

10. 单击**授权**选项卡。

    将显示类似于以下内容的授权设置页面：

    授权设置

    ![authz-settings.png](https://www.keycloak.org/docs/latest/authorization_services/images/getting-started/hello-world/authz-settings.png)

当您为客户端应用程序启用授权服务时，Keycloak 会自动为您的客户端授权配置创建几个默认设置。

额外资源

- [启用授权服务](https://www.keycloak.org/docs/latest/authorization_services/index.html#_resource_server_enable_authorization)
- [默认配置](https://www.keycloak.org/docs/latest/authorization_services/index.html#_resource_server_default_config)

### **构建、部署和测试您的应用程序**

现在**app-authz-vanilla**资源服务器（或客户端）已正确配置并启用授权服务，可以将其部署到服务器。

您要部署的应用程序的项目和代码在[Keycloak Quickstarts Repository](https://github.com/keycloak/keycloak-quickstarts)中可用。在继续之前，您需要在计算机上安装以下内容并在您的 PATH 中可用：

- Java JDK 8
- Apache Maven 3.1.1 或更高版本
- Git

[您可以通过在 https://github.com/keycloak/keycloak-quickstarts](https://github.com/keycloak/keycloak-quickstarts)克隆存储库来获取代码。快速入门旨在与最新的 Keycloak 版本一起使用。

按照以下步骤下载代码。

克隆项目

```shell
 git clone https://github.com/keycloak/keycloak-quickstarts
```

我们即将构建和部署的应用程序位于

```shell
cd keycloak-quickstarts/app-authz-jee-vanilla
```

### **获取适配器配置**

在构建和部署应用程序之前，您必须先获取适配器配置。

程序

1. 登录管理控制台。
2. 单击菜单中的**客户端。**
3. 在客户端列表中，单击**app-authz-vanilla**客户端应用程序。客户端设置页面打开。

   客户端设置

   ![enable-authz.png](https://www.keycloak.org/docs/latest/authorization_services/images/getting-started/hello-world/enable-authz.png)

4. 从**操作**列表中，选择**下载适配器配置**。
5. 从格式选项列表中，选择**Keycloak OIDC JSON**。

   适配器配置以 JSON 格式显示。

6. 单击**下载**。

   适配器配置

   ![adapter-config.png](https://www.keycloak.org/docs/latest/authorization_services/images/getting-started/hello-world/adapter-config.png)

7. 将文件移动`keycloak.json`到`app-authz-jee-vanilla/config`目录。
8. （可选）指定重定向 URL。

   `403`默认情况下，当用户没有访问资源服务器上受保护资源的权限时，策略执行器会使用状态代码进行响应。但是，您也可以为未经授权的用户指定重定向 URL。要指定重定向 URL，请编辑您更新的**keycloak.json**文件并将`policy-enforcer`配置替换为以下内容：

   `"policy-enforcer": {
    "on-deny-redirect-to" : "/app-authz-vanilla/error.jsp"
}`

   `/app-authz-vanilla/error.jsp`如果用户没有访问受保护资源的必要权限，而不是无用的消息，则此更改指定策略执行者将用户重定向到页面`403 Unauthorized`。
