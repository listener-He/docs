---
password: ""
icon: ""
date: "2022-03-05"
type: Post
category: 技术分享
urlname: "46"
catalog:
  - archives
tags:
  - Spring
  - 微服务
  - 分布式
summary: API 网关是一个服务器，是系统对外的唯一入口。API 网关封装了系统内部架构，为每个客户端提供定制的 API。所有的客户端和消费端都通过统一的网关接入微服务，在网关层处理所有非业务功能。API 网关并不是微服务场景中必须的组件，如下图，不管有没有 API 网关，后端微服务都可以通过 API 很好地支持客户端的访问
sort: ""
title: API网关之Gateway
status: Published
cover: "https://cdn.jsdelivr.net/gh/listener-He/images@default/202305102209640.png"
updated: "2023-10-08 14:42:00"
---

# Gateway

## **什么是服务网关**

`API Gateway`，顾名思义，是出现在系统边界上的一个面向 API 的、串行集中式的强管控服务，这里的边界是系统服务的边界，可以理解为`服务防火墙`，主要起到`隔离外部访问与内部系统的作用`。在微服务概念的流行之前，API 网关就已经诞生了，例如银行、证券等领域常见的前置机系统，它也是解决访问认证、报文转换、访问统计等问题的。

API 网关的流行，源于近几年来移动应用与企业间互联需求的兴起。移动应用、企业互联，使得后台服务支持的对象，从以前单一的 Web 应用，扩展到多种使用场景，且每种使用场景对后台服务的要求都不尽相同。这不仅增加了后台服务的响应量，还增加了后台服务的复杂性。`随着微服务架构概念的提出，API网关成为了微服务架构的一个标配组件`。

API 网关是一个服务器，是系统对外的唯一入口。API 网关封装了系统内部架构，为每个客户端提供定制的 API。所有的客户端和消费端都通过统一的网关接入微服务，在网关层处理所有非业务功能。API 网关并不是微服务场景中必须的组件，如下图，不管有没有 API 网关，后端微服务都可以通过 API 很好地支持客户端的访问。

![1280X1280.png](https://blog-file.hehouhui.cn/1280X1280.png)

API 网关出现的原因是微服务架构的出现，不同的微服务一般会有不同的网络地址，而外部客户端可能需要调用多个服务的接口才能完成一个业务需求，如果让客户端直接与各个微服务通信，会有以下的问题：

- 客户端会多次请求不同的微服务，增加了客户端的复杂性。
- 存在跨域请求，在一定场景下处理相对复杂。
- 认证复杂，每个服务都需要独立认证。
- 难以重构，随着项目的迭代，可能需要重新划分微服务。例如，可能将多个服务合并成一个或者将一个服务拆分成多个。如果客户端直接与微服务通信，那么重构将会很难实施。
- 某些微服务可能使用了防火墙 / 浏览器不友好的协议，直接访问会有一定的困难。

**API 网关方式的核心要点是，所有的客户端和消费端都通过统一的网关接入微服务，** 在网关层处理所有的非业务功能。通常，网关也是提供 REST/HTTP 的访问 API。

## **网关解决了什么问题**

但对于服务数量众多、复杂度比较高、规模比较大的业务来说，引入 API 网关也有一系列的好处：

- 聚合接口使得服务对调用者透明，客户端与后端的耦合度降低
- 聚合后台服务，节省流量，提高性能，提升用户体验
- 提供安全、流控、过滤、缓存、计费、监控等 API 管理功能

![clip_image003.png](https://blog-file.hehouhui.cn/clip_image003.png)

网关应当具备以下功能

- 性能：API 高可用，负载均衡，容错机制。
- 安全：权限身份认证、脱敏，流量清洗分发，后端签名（保证全链路可信调用），黑名单（非法调用的限制）。
- 日志：日志记录，一旦涉及分布式，全链路跟踪必不可少。
- 缓存：数据缓存。
- 监控：记录请求响应数据，API 耗时分析，性能监控。
- 限流：流量控制，错峰流控，可以定义多种限流规则。
- 灰度：线上灰度部署，可以减小风险。
- 路由：动态路由规则。

主要功能

- 数据平面主要功能是接入用户的 HTTP 请求和微服务被拆分后的聚合。使用微服务网关统一对外暴露后端服务的 API 和契约，路由和过滤功能正是网关的核心能力模块。另外，微服务网关可以实现拦截机制和专注跨横切面的功能，包括协议转换、安全认证、熔断限流、灰度发布、日志管理、流量监控等。
- 控制平面主要功能是对后端服务做统一的管控和配置管理。例如，可以控制网关的弹性伸缩；可以统一下发配置；可以对网关服务添加标签；

# **Spring Cloud Gateway**

> Spring Cloud Gateway 是基于 Spring 生态系统之上构建的 API 网关，包括：Spring 5，Spring Boot 2 和 Project Reactor。Spring Cloud Gateway 旨在提供一种简单而有效的方法来路由到 API，并为它们提供跨领域的关注点，例如：安全性，监视/指标，限流等。

    由于 Spring 5.0 支持 Netty，Http2，而 Spring Boot 2.0 支持 Spring 5.0，因此 Spring Cloud Gateway 天然支持 Netty 和 Http2。

Spring Cloud Gateway 建立在[Spring Boot 2.x](https://spring.io/projects/spring-boot#learn)、[Spring WebFlux](https://docs.spring.io/spring/docs/current/spring-framework-reference/web-reactive.html)和[Project Reactor](https://projectreactor.io/docs)之上（基于⾼性能的 Reactor 模式响应式通信框架 Netty，异步⾮阻塞模型）。因此当使用 Spring Cloud Gateway 时，许多熟悉的同步库（例如 Spring Data 和 Spring Security）和模式可能并不适用。

Spring Cloud Gateway 需要 Spring Boot 和 `Spring Webflux` 提供的 `Netty` 运行时。它不适用于传统的 Servlet 容器或构建为 WAR 时。

## **核心概念**

- **Route:** The basic building block of the gateway. It is defined by an ID, a destination URI, a collection of predicates, and a collection of filters. A route is matched if the aggregate predicate is true.
  - 路由是构建网关的基本模块，它由 ID，目标 URI，一系列的断言和过滤器组成，如果断言为 true 则匹配该路由
- **Predicate**: This is a [Java 8 Function Predicate](https://docs.oracle.com/javase/8/docs/api/java/util/function/Predicate.html). The input type is a [Spring Framework ServerWebExchange](https://docs.spring.io/spring/docs/5.0.x/javadoc-api/org/springframework/web/server/ServerWebExchange.html). This lets you match on anything from the HTTP request, such as headers or parameters.
  - 参考的是 java8 的 java.util.function.Predicate 开发人员可以匹配 HTTP 请求中的所有内容（例如请求头或请求参数），如果请求与断言相匹配则进行路由
- **Filter**: These are instances of `GatewayFilter` that have been constructed with a specific factory. Here, you can modify requests and responses before or after sending the downstream request.
  - 指的是 Spring 框架中 GatewayFilter 的实例，使用过滤器，可以在请求被路由前或者之后对请求进行修改。

工作流程

![clip_image005.png](https://blog-file.hehouhui.cn/clip_image005.png)

如上图所示，客户端向 `Spring Cloud Gateway` 发出请求。再由网关处理程序 `Gateway Handler Mapping` 映射确定与请求相匹配的路由，将其发送到网关 Web 处理程序 `Gateway Web Handler`。该处理程序通过指定的过滤器链将请求发送到我们实际的服务执行业务逻辑，然后返回。过滤器由虚线分隔的原因是，过滤器可以在发送代理请求之前和之后运行逻辑。所有 `pre` 过滤器逻辑均被执行。然后发出代理请求。发出代理请求后，将运行 `post` 过滤器逻辑。

## **Predicate 断言**

SpringCloud Gateway 包括许多内置的 Route Predicate 工厂。所有这些 Predicate 都与 HTTP 请求的不同属性匹配。多个 Route Predicate 工厂可以进行组合。

SpringCloud Gateway 创建 Route 对象时，使用 RoutePredicateFactory 创建 Predicate 对象，Predicate 对象可以赋值给 Route。SpringCloud Gateway 包含许多内置的 RoutePredicateFactories。

所有这些断言都匹配 HTTP 请求的不同属性。多种断言工厂可以组合，并通过逻辑 and。

> SpringCloud Gateway 将路由匹配作为 Spring WebFlux HandlerMapping 基础架构的一部分。

```text
server:
  port: 11001
spring:
  application:
    name: gateway
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true  #开启从注册中心动态创建路由的功能，利用微服务名进行路由
      routes:
        - id: blog-admin #路由的ID，没有固定规则但要求唯一，建议配合服务名
          #uri: <http://localhost:8001>   #匹配后提供服务的路由地址
          uri: lb://blog-service
          predicates:
            - Path=/api/admin/**   #断言,路径相匹配的进行路由
   - id: blog
      #uri: <http://localhost:8001>   #匹配后提供服务的路由地址
      uri: lb://blog-service
      predicates:
        - Path=/archives/**   #断言,路径相匹配的进行路由
        #- After=2020-03-08T10:59:34.102+08:00[Asia/Shanghai]
        #- Cookie=username,zhangshuai #并且Cookie是username=zhangshuai才能访问
        #- Header=X-Request-Id, \\d+ #请求头中要有X-Request-Id属性并且值为整数的正则表达式
        #- Host=**.atguigu.com
        #- Method=GET
        #- Query=username, \\d+ #要有参数名称并且是正整数才能路由

```

### **内置谓词断言**

- **After Route Predicate Factory** 匹配在指定日期时间之后发生的请求
  - 参数：datetime
  - 注意时间格式带时区 ZonedDateTime
  - `spring: cloud: gateway: routes: - id: after_route_test uri: <https://www.hehouhui.cn> predicates: - After=2022-07-10T17:42:00.789-07:00[Asia/Shanghai]`
- **Before Route Predicate Factory** 匹配在指定日期时间之前发生的请求

  ```text
  参数：datetime

  ```

注意时间格式带时区 ZonedDateTime

```text
 spring:
  cloud:
    gateway:
      routes:
      - id: before_route_test
        uri: <https://www.hehouhui.cn>
        predicates:
        - Before=2022-07-10T17:43:48.789-07:00[Asia/Shanghai]

```

- **Between Route Predicate Factory** 匹配在指定范围日期时间发生的请求
  - 参数：datetime1 开始
  - datetime2 结束
  - 注意时间格式带时区 ZonedDateTime
  - `spring: cloud: gateway: routes: - id: between_route_test uri: <https://www.hehouhui.cn> predicates: - Between=2022-07-10T17:42:30.789-07:00[Asia/Shanghai],2022-07-10T17:42:59.789-07:00[Asia/Shanghai]`
- **Cookie Route Predicate Factory** 匹配在指定包含指定 cookie 值的请求

参数：name cookie 名称

- regexp 匹配值的正则
- `spring: cloud: gateway: routes: - id: cookie_route_test uri: <https://www.hehouhui.cn> predicates: - Cookie=token,allow_account`
- **Header Route Predicate Factory** 匹配在指定包含指定请求头的请求

参数：name 请求头的名称

```text
               regexp 匹配值的正则

```

```text
 spring:
  cloud:
    gateway:
      routes:
      - id: handler_route_test
        uri: <https://www.hehouhui.cn>
        predicates:
        - Handler=User-Agent,*Mac OS*

```

- **Host Route Predicate Factory** 请求主机地址匹配

  ```text
  参数： patterns 正则集合

  ```

```text
 spring:
  cloud:
    gateway:
      routes:
      - id: host_route_test
        uri: <https://www.hehouhui.cn>
        predicates:
        - Host=blog.hehouhui.cn

```

- **Method Route Predicate Factory** 请求方法的匹配

  ```text
  参数： methods 集合

  ```

```text
 spring:
  cloud:
    gateway:
      routes:
      - id: method_route_test
        uri: <https://www.hehouhui.cn>
        predicates:
        - Method=Get,Post

```

- **Path Route Predicate Factory** 请求路由规则匹配

  ```text
  参数：patterns 匹配集合

  ```

```text
spring:
  cloud:
    gateway:
      routes:
      - id: path_route_test
        uri: <https://www.hehouhui.cn>
        predicates:
        - Path=/test/**

```

- **Query Route Predicate Factory** 请求参数 url ？后的参数

  ```text
  参数  param 参数名

            regexp 参数匹配值，如果为空的情况下表示任何值

  ```

```text
spring:
  cloud:
    gateway:
      routes:
      - id: query_route_test
        uri: <https://www.hehouhui.cn>
        predicates:
        - Query=name,laiweihua

```

- **RemoteAddr Route Predicate Factory** 客户端请求 IP 匹配

  ```text
  参数：sources 注意此处为cidr格式 CIDR 表示法（IPv4 或 IPv6）字符串

  ```

```text
spring:
  cloud:
    gateway:
      routes:
      - id: remoteAddr_route_test
        uri: <https://www.hehouhui.cn>
        predicates:
        - RemoteAddr=192.168.1.1/24

```

默认情况下，RemoteAddr 路由谓词工厂使用来自传入请求的远程地址。如果 Spring Cloud Gateway 位于代理层后面，这可能与实际客户端 IP 地址不匹配。

可以通过设置自定义来自定义解析远程地址的方式`RemoteAddressResolver`。Spring Cloud Gateway 带有一个基于[X-Forwarded-For 标头](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For)的非默认远程地址解析器，`XForwardedRemoteAddressResolver`.

`XForwardedRemoteAddressResolver`有两个静态构造方法，它们采用不同的安全方法：

- `XForwardedRemoteAddressResolver::trustAll`返回`RemoteAddressResolver`始终采用在`X-Forwarded-For`标头中找到的第一个 IP 地址的 a。这种方法容易受到欺骗，因为恶意客户端可以为 设置初始值，`X-Forwarded-For`解析器会接受该值。
- `XForwardedRemoteAddressResolver::maxTrustedIndex`采用与 Spring Cloud Gateway 前运行的受信任基础架构数量相关的索引。例如，如果 Spring Cloud Gateway 只能通过 HAProxy 访问，则应使用值 1。如果在访问 Spring Cloud Gateway 之前需要两跳可信基础架构，则应使用值 2。
- **Weight Route Predicate Factory** 权重路由匹配

  参数： group 自定义分组名称

  ```text
          weight 权重

  ```

```text
spring:
  cloud:
    gateway:
      routes:
      - id: weight_high
        uri: <https://www.hehouhui.cn>
        predicates:
        - Weight=group, 8
      - id: weight_low
        uri: <https://blog.hehouhui.cn>
        predicates:
        - Weight=group, 2

```

```text
  该路由会将约 80% 的流量转发到 <https://www.hehouhui.cn>，将约 20% 的流量转发到https://blog.hehouhui.cn

```

- **XForwarded Remote Addr Route Predicate Factory** 根据 X-Forwarded-For 请求头匹配

  参数：sources 注意此处为 cidr 格式

```text
spring:
  cloud:
    gateway:
      routes:
      - id: xforwarded_route
        uri: <https://www.hehouhui.cn>
        predicates:
        - XForwardedRemoteAddr=192.168.1.1/24

```

## **Filter 过滤器**

### **GlobaFilter 全局过滤器**

> GlobaFilter 全局过滤器，不需要在配置文件中配置，系统初始化时加载，并作用在每个路由上。 SpringCloud Gateway 核心的功能也是通过内置的全局过滤器来完成

| 类名                             | 作用                                                                                                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CustomGlobalFilter               | 组合所有过滤器的排序,包含 GlobaFilter 和 GatewayFilter。Gateway 区分过滤器逻辑执行的“前”和“后”阶段，具有最高优先级的过滤器是“前”阶段的第一个和“后”阶段的最后一个 -阶段。 |
| ForwardRoutingFilter             | forward://开头的 url 协议将会被转发                                                                                                                                      |
| ReactiveLoadBalancerClientFilter | 将以 lb://开头的 url 经过 ReactorLoadBalancer 路由加载转换                                                                                                               |
| NettyRoutingFilter               | http 或者 https 协议 由 Netty 过滤器运行。它使用 NettyHttpClient 发出下游代理请求                                                                                        |
| NettyWriteResponseFilter         | 并将代理响应写回网关客户端响应                                                                                                                                           |
| RouteToRequestUrlFilter          | 将 Route 对象转为 URL,并存储原 Route 信息                                                                                                                                |
| WebsocketRoutingFilter           | 将以 ws,wss 或请求头 Upgrade = WebSocket 的 http,https 以 We bsocket 协议执行                                                                                            |
| GatewayMetricsFilter             | 路由指标数据收集用于集成 Grafana 仪表板                                                                                                                                  |
|                                  |                                                                                                                                                                          |

### **AbstractGatewayFilterFactory 局部过滤器工厂**

> GatewayFilter 局部过滤器，是针对单个路由的过滤器。 在 SpringCloud Gateway 组件中提供了大量内置的局部过滤器，对请求和响应坐过滤操作。

> 遵循约定大于配置的思想，只需要在配置文件配置局部过滤器名称，并为其制定对应的值。就可以让其生效。

| 名称                          | 作用                                                                                                   | 参数                                                                                                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AddRequestHeader              | 为路由添加请求头                                                                                       | name,value                                                                                                                                                                                                    |
| AddRequestParameter           | 为路由添加请求 query 参数(拼接在 url 后)                                                               | name,value                                                                                                                                                                                                    |
| AddResponseHeader             | 为路由添加响应头                                                                                       | name,value                                                                                                                                                                                                    |
| DedupeResponseHeader          | 响应头去重,默认取响应头的首个 value，最主要是用来处理自 2.2.5 版本后网关和下游服务都处理了 CORS 的 bug | name,strategy                                                                                                                                                                                                 |
| CircuitBreaker                | 路由断路器，在服务异常或者返回指定状态码时转发路由至指定 fallbackUri                                   | name,fallbackUri,routeId,statusCodes                                                                                                                                                                          |
| FallbackHeaders               | 在执行请求转发时添加指定的请求头信息                                                                   |                                                                                                                                                                                                               |
| MapRequestHeader              | copy 请求头中指定值到新的请求头中                                                                      | fromHeader,toHeader                                                                                                                                                                                           |
| PrefixPath                    | 为路由 URL 添加统一前缀                                                                                | prefix                                                                                                                                                                                                        |
| PreserveHostHeader            | 无特殊逻辑，只是标记一下路由为原始请求                                                                 |                                                                                                                                                                                                               |
| RequestRateLimiter            | 路由限流，由 KeyResolver 解析出路由细粒度，RateLimiter 进行限流处理                                    | keyResolver, **rate-limiter.replenish-rate ,rate-limiter.burst-capacity,rate-limiter.requested-tokens**。requestedTokens 每次请求消耗多少令牌，burstCapacity 令牌桶总容量，replenishRate 每多少秒生产一枚令牌 |
| RedirectTo                    | 请求转发                                                                                               |                                                                                                                                                                                                               |
| RemoveRequestHeader           | 删除请求头                                                                                             |                                                                                                                                                                                                               |
| RemoveResponseHeader          | 删除响应头                                                                                             |                                                                                                                                                                                                               |
| RemoveRequestParameter        | 删除请求参数                                                                                           |                                                                                                                                                                                                               |
| RequestHeaderSize             | 累计请求头 value bytes 大小不超过最大值                                                                |                                                                                                                                                                                                               |
| RewritePath                   | 重写 Path                                                                                              |                                                                                                                                                                                                               |
| RewriteLocationResponseHeader | 修改 Location 的值                                                                                     |                                                                                                                                                                                                               |
| RewriteResponseHeader         | 重写响应头值                                                                                           |                                                                                                                                                                                                               |
| SaveSession                   | 保存 session                                                                                           |                                                                                                                                                                                                               |
| SecureHeaders                 | 安全生命请求头                                                                                         |                                                                                                                                                                                                               |
| SetPath                       | 设置新 Path                                                                                            |                                                                                                                                                                                                               |
| SetRequestHeader              | 设置请求头                                                                                             |                                                                                                                                                                                                               |
| SetResponseHeader             | 设置响应头                                                                                             |                                                                                                                                                                                                               |
| SetStatus                     | 设置状态码                                                                                             |                                                                                                                                                                                                               |
| StripPrefix                   | 路由摘除以/分割                                                                                        | parts                                                                                                                                                                                                         |
| Retry                         | 路由重试                                                                                               | retries：重试次数,statuses: 判断可重试的状态吗默认 5xx,methods: 支持重试的请求方法,exceptions: 重试的抛出异常列表                                                                                             |
| RequestSize                   | 通过 Content-length 判断是否超过最大请求大小                                                           |                                                                                                                                                                                                               |
| SetRequestHostHeader          | 清除原请求头 Host，并添加新值                                                                          |                                                                                                                                                                                                               |
| ModifyRequestBody             | 修改请求体                                                                                             |                                                                                                                                                                                                               |
| ModifyResponseBody            | 修改响应体                                                                                             |                                                                                                                                                                                                               |
| TokenRelay                    | OAuth2 标准认证服务，执行授权认证后并将信息传递下游服务                                                |                                                                                                                                                                                                               |
| CacheRequestBody              | 缓存请求体                                                                                             |                                                                                                                                                                                                               |

### RouteLocator

    路由配置加载

### ConfigurationService

路由&谓词&过滤器工程等动态配置等实现
