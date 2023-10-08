## 介绍

Spring 框架一直提供了两种不同的客户端来执行 http 请求:

- RestTemplate: 它在 Spring 3 中被引入，提供同步的阻塞式通信。
- WebClient: 它在 Spring 5 的 Spring WebFlux 库中作为一部分被发布。它提供了流式 API,遵循响应式模型。

RestTemplate 的方法暴露了太多的 HTTP 特性,导致了大量重载的方法，使用成本较高。WebClient 是 RestTemplate 的替代品,支持同步和异步调用。它是 Spring Web Reactive 项目的一部分。

现在 Spring 6.1 M1 版本引入了 RestClient。一个新的同步 http 客户端,其工作方式与 WebClient 类似,使用与 RestTemplate 相同的基础设施。

## 准备项目

### jar 依赖

```xml
<dependency>  
	<groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

![](https://cdn.jsdelivr.net/gh/listener-He/images@default/202309061708385.png)

## 创建全局 RestClient

创建 RestClient 实例有可用的静态方法:

- create(): 委托给默认的 rest 客户端。
- create(String url): 接受一个默认的基础 url。
- create(RestTemplate restTemplate): 基于给定 rest 模板的配置初始化一个新的 RestClient。
- builder(): 允许使用 headers、错误处理程序、拦截器等选项自定义一个 RestClient。
- builder(RestTemplate restTemplate): 基于给定 RestTemplate 的配置获取一个 RestClient builder。

让我们使用 builder 方法调用客户 API 来编写一个 RestClient:

```java
RestClient restClient = RestClient.builder()
    .baseUrl(properties.getUrl())
    .defaultHeader(HttpHeaders.AUTHORIZATION, encodeBasic("pig", "pig"))
    .build();
```

参数说明:

- baseUrl 设置基础 url
- defaultHeader 允许设置一个默认 http 请求头

## 接收数据 retrieve

下一步是使用客户端发送 http 请求并接收响应。RestClient 为每种 HTTP 方法都提供了方法。例如,要搜索所有活动客户,必须执行 GET 请求。retrieve 方法获取响应并声明如何提取它。

让我们从使用完整正文作为 String 的简单情况开始。

```java
String data = restClient.get()
    .uri("?name={name}&type={type}", "lengleng", "1")
    .accept(MediaType.APPLICATION_JSON)
    .retrieve()
    .body(String.class);
```

uri 方法可以设置 http 参数第一个参数(一个字符串模板)是附加到 RestClient 中定义的 base url 的查询字符串。第二个参数是模板的 uri 变量(varargs)。

我们还指定媒体类型为 JSON。输出显示在控制台中:

```json
[
  {
    "id": 1,
    "name": "lengleng",
    "type": "1"
  }
]
```

如果需要检查响应状态码或响应头怎么办?别担心,toEntity 方法会返回一个 **ResponseEntity**。

```java
ResponseEntity response = restClient
    .get()
    .uri("?name={name}&type={type}", "lengleng", "1")
    .accept(MediaType.APPLICATION_JSON)
    .retrieve()
    .toEntity(String.class);

logger.info("Status " + response.getStatusCode());
logger.info("Headers " + response.getHeaders());
```

## 结果转换 Bean

RestClient 还可以将响应主体转换为 JSON 格式。Spring 将自动默认注册 MappingJackson2HttpMessageConverter 或 MappingJacksonHttpMessageConverter,如果在类路径中检测到 Jackson 2 库或 Jackson 库。但是你可以注册自己的消息转换器并覆盖默认设置。

在我们的例子中,响应可以直接转换为记录。例如,检索特定客户的 API:

```java
ReqUserResponse customer = restClient.get()
    .uri("/{name}", "lengleng")
    .accept(MediaType.APPLICATION_JSON)
    .retrieve()
    .body(ReqUserResponse.class);
logger.info("res name: " + customer.personInfo().name());
```

要搜索客户,我们只需要使用 List 类,如下所示:

```java
List<ReqUserResponse> customers = restClient.get()
    .uri("?type={type}", "1")
    .accept(MediaType.APPLICATION_JSON)
    .retrieve()
    .body(List.class);

logger.info("res size " + customers.size());
```

## 发布数据

要发送 post 请求,只需调用 post 方法。下一段代码片段创建一个新客户。

```java
ReqUserResponse customer = new ReqUserResponse("lengleng-plus", "1");
ResponseEntity<Void> response = restClient
    .post()
    .accept(MediaType.APPLICATION_JSON)
    .body(customer)
    .retrieve()
    .toBodilessEntity();

if (response.getStatusCode().is2xxSuccessful()) {
    logger.info("Created " + response.getStatusCode());
    logger.info("New URL " + response.getHeaders().getLocation());
}
```

响应代码确认客户已成功创建:

```text
Created 201 CREATEDNew URL http://localhost:8080/api/v1/customers/11
```

要验证客户是否已添加,可以通过 postman 检索以上 URL:

```text
{  "id": 2,  "name": "lengleng-plus",  "type": "1"}
```

当然,可以使用与前一节类似的代码通过 RestClient 获取它。

## 删除数据

调用 delete 方法发出 HTTP delete 请求尝试删除资源非常简单。

```java
ResponseEntity<Void> response = restClient.delete()
    .uri("/{id}", 2)
    .accept(MediaType.APPLICATION_JSON)
    .retrieve()
    .toBodilessEntity();
logger.info("Deleted with status " + response.getStatusCode());
```

值得一提的是,如果操作成功,响应主体将为空。对于这种情况,toBodilessEntity 方法非常方便。要删除的客户 ID 作为 uri 变量传递。

```text
Deleted with status 204 NO_CONTENT
```

## 处理错误

如果我们尝试删除或查询一个不存在的客户会发生什么?客户端点将返回一个 404 错误代码以及消息详细信息。然而,每当接收到客户端错误状态码(400-499)或服务器错误状态码(500-599)时,RestClient 将抛出 RestClientException 的子类。

要定义自定义异常处理程序,有两种选项适用于不同的级别:

- 在 RestClient 中使用 defaultStatusHandler 方法(对其发送的所有 http 请求)

```java
RestClient restClient = RestClient.builder()
    .baseUrl(properties.getUrl())
    .defaultHeader(HttpHeaders.AUTHORIZATION, encodeBasic("pig", "pig"))
    .defaultStatusHandler(
        HttpStatusCode::is4xxClientError,
        (request, response) -> {
            logger.error("Client Error Status " + response.getStatusCode());
            logger.error("Client Error Body " + new String(response.getBody().readAllBytes()));
        }
    )
    .build();
```

在运行删除命令行运行程序后,控制台的输出如下:

```text
Client Error Status 404 NOT_FOUNDClient Error Body {"status":404,"message":"Entity Customer for id 2 was not found.","timestamp":"2023-07-23T09:24:55.4088208"}
```

- 另一种选择是为删除操作实现 **onstatus** 方法。它优先于 RestClient 默认处理程序行为。

```java
ResponseEntity response = restClient.delete()
    .uri("/{id}", 2)
    .accept(MediaType.APPLICATION_JSON)
    .retrieve()
    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> logger.error("Couldn't delete " + res.getStatusText()))
    .toBodilessEntity();
if (response.getStatusCode().is2xxSuccessful())
    logger.info("Deleted with status " + response.getStatusCode());
```

现在控制台中的消息将是:

```text
Couldn't delete Not Found
```

## Exchange 方法

当响应必须根据响应状态进行不同解码时,exchange 方法很有用。使用 exchange 方法时,状态处理程序将被忽略。

在这个虚构的示例代码中,响应基于状态映射到实体:

```java
SimpleResponse simpleResponse = restClient.get()
    .uri("/{id}", 4)
    .accept(MediaType.APPLICATION_JSON)
    .exchange((req, res) -> switch (res.getStatusCode().value()) {
        case 200 -> SimpleResponse.FOUND;
        case 404 -> SimpleResponse.NOT_FOUND;
        default -> SimpleResponse.ERROR;
    });
```

## 总结

与旧的 RestTemplate 相比,这个新 API 更易于管理，官方重构的目的绝非是造轮子，而是目标去实现基于 Loom 标准的的 Http 客户端,更好的适配 JDK21 的虚拟线程，提供更高性能的客户端实现。
