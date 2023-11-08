---
password: ""
icon: ""
date: "2021-08-27"
type: Post
category: 技术分享
urlname: "20"
catalog:
  - archives
tags:
  - Spring
  - 微服务
  - 分布式
  - Redis
summary: 在SpringCloud体系中，我们知道服务之间的调用是通过http协议进行调用的。而注册中心的主要目的就是维护这些服务的服务列表。我们知道，在Spring中，提供了RestTemplate。RestTemplate是Spring提供的用于访问Rest服务的客户端。而在SpringCloud中也是使用此服务进行服务调用的。
sort: ""
title: RestTemplate与OpenFeign
status: Published
cover: "https://www.notion.so/images/page-cover/webb2.jpg"
updated: "2023-10-08 14:42:00"
---

# RestTemplate

在`SpringCloud`体系中，我们知道服务之间的调用是通过`http`协议进行调用的。而注册中心的主要目的就是维护这些服务的服务列表。我们知道，在`Spring`中，提供了`RestTemplate`。`RestTemplate`是`Spring`提供的用于访问 Rest 服务的客户端。而在`SpringCloud`中也是使用此服务进行服务调用的。

同时在微服务中，一般上服务都不会进行单点部署的，都会至少部署 2 台及以上的。现在我们有了注册中心进行服务列表的维护，就需要一个客户端负载均衡来进行动态服务的调用。

所以开始示例前，我们先来大致了解下关于`负载均衡`和`RestTemplate`的相关知识点。其实后面实例的`Ribbon`和`Feign`最后的调用都是基于`RestTemplate`的。使用比较简单~

### 何为负载均衡

> 负载均衡(Load Balance)是分布式系统架构设计中必须考虑的因素之一，它通常是指，将请求/数据**【均匀】分摊**到多个操作单元上执行，负载均衡的关键在于【均匀】。

### 实现的方式

实现负载均衡的方式有很多种，这里简单介绍下几种方式，并未过多深入。

**注意：以下部分内容转至**[**几种负载均衡技术的实现**](https://blog.csdn.net/mengdonghui123456/article/details/53981976)**。**

1.HTTP 重定向负载均衡

> 根据用户的 http 请求计算出一个真实的 web 服务器地址，并将该 web 服务器地址写入 http 重定向响应中返回给浏览器，由浏览器重新进行访问

![60217159.jpg](http://qiniu.xds123.cn/18-9-20/60217159.jpg)

**优缺点：实现起来很简单，而缺点也显而易见了：请求两次才能完成一次访问；性能差;重定向服务器会成为瓶颈**

2.DNS 域名解析负载均衡

> 在 DNS 服务器上配置多个域名对应 IP 的记录。例如一个域名www.baidu.com对应一组web服务器IP地址，域名解析时经过DNS服务器的算法将一个域名请求分配到合适的真实服务器上。

![60831825.jpg](http://qiniu.xds123.cn/18-9-20/60831825.jpg)

**优缺点：加快访问速度,改善性能。同时由于 DNS 解析是多级解析，每一级 DNS 都可能化缓存记录 A，当某一服务器下线后，该服务器对应的 DNS 记录 A 可能仍然存在，导致分配到该服务器的用户访问失败，而且 DNS 负载均衡采用的是简单的轮询算法，不能区分服务器之间的差异，不能反映服务器当前运行状态。**

3.反向代理负载均衡

> 反向代理处于 web 服务器这边，反向代理服务器提供负载均衡的功能，同时管理一组 web 服务器，它根据负载均衡算法将请求的浏览器访问转发到不同的 web 服务器处理，处理结果经过反向服务器返回给浏览器。

![44882339.jpg](http://qiniu.xds123.cn/18-9-20/44882339.jpg)

**优缺点：实现简单，可利用反向代理缓存资源(这是最常用的了)及改善网站性能。同时因为是所有请求和响应的中转站，所以反向代理服务器可能成为瓶颈。**

**以上仅仅是部分实现方式，还有比如\*\***`IP负载均衡`\***\*、\*\***`数据链路层负载均衡`\***\*等等，这些可能涉及到相关网络方面的知识点了，不是很了解，大家有兴趣可以自行搜索下吧。**

### 客户端和服务端的负载均衡

实现负载均衡也又区分客户端和服务端之分，`Ribbon`就是基于客户端的负载均衡。
客户端负载均衡：

![49529849.jpg](http://qiniu.xds123.cn/18-9-20/49529849.jpg)

服务端负载均衡：

![19525388.jpg](http://qiniu.xds123.cn/18-9-20/19525388.jpg)

服务端实现负载均衡方式有很多，比如：`硬件F5`、`Nginx`、`HA Proxy`等等，这些应该实施相关人员应该比较熟悉了，本人可能也就对`Nginx`了解下，⊙﹏⊙‖∣

### RestTemplate 简单介绍

> RestTemplate 是 Spring 提供的用于访问 Rest 服务的客户端，RestTemplate 提供了多种便捷访问远程 Http 服务的方法，能够大大提高客户端的编写效率。

![9663891.jpg](http://qiniu.xds123.cn/18-9-20/9663891.jpg)

简单来说，`RestTemplate`采用了`模版设计`的设计模式，将过程中与特定实现相关的部分委托给接口,而这个接口的不同实现定义了接口的不同行为,所以可以很容易的使用不同的第三方 http 服务，如`okHttp`、`httpclient`等。

`RestTemplate`定义了很多的与 REST 资源交互，这里简单介绍下一些常用的请求方式的使用。

### exchange

在 URL 上执行特定的 HTTP 方法，返回包含对象的`ResponseEntity`。其他的如`GET`、`POST`等方法底层都是基于此方法的。

![91101426.jpg](http://qiniu.xds123.cn/18-9-20/91101426.jpg)

如：

- get 请求

```text
RequestEntity requestEntity = RequestEntity.get(new URI(uri)).build();
ResponseEntity<User> responseEntity2 = this.restTemplate.exchange(requestEntity, User.class);

```

- post 请求

```text
RequestEntity<User> requestEntity = RequestEntity.post(new URI(uri)).body(user);
ResponseEntity<User> responseEntity2 = this.restTemplate.exchange(requestEntity, User.class);

```

### GET 请求

> get 请求可以分为两类：getForEntity() 和 getForObject().

![50274746.jpg](http://qiniu.xds123.cn/18-9-20/50274746.jpg)

```text
// 1-getForObject()
User user1 = this.restTemplate.getForObject(uri, User.class);

// 2-getForEntity()
ResponseEntity<User> responseEntity1 = this.restTemplate.getForEntity(uri, User.class);
HttpStatus statusCode = responseEntity1.getStatusCode();
HttpHeaders header = responseEntity1.getHeaders();
User user2 = responseEntity1.getBody();

```

其他的方法都大同小异了，可以根据实际的业务需求进行调用。

### POST 请求

![94233042.jpg](http://qiniu.xds123.cn/18-9-20/94233042.jpg)

简单示例：

```text
// 1-postForObject()
User user1 = this.restTemplate.postForObject(uri, user, User.class);

// 2-postForEntity()
ResponseEntity<User> responseEntity1 = this.restTemplate.postForEntity(uri, user, User.class);

```

**关于\*\***`postForLocation()`\***\*，用的比较少，作用是返回新创建资源的 URI，前面介绍的两者是返回资源本身，也就是结果集了。**

关于其他的请求类型相关用法，这里就不详细阐述了，都是类似的。可以查看下此文章：[详解 RestTemplate 操作](https://blog.csdn.net/itguangit/article/details/78825505)，讲的蛮详细了。

- \*特别说明：系列教程为了方便，github 上分别创建了一个单体的`Eureka`注册中心和高可用的`Eureka`注册中心，无特殊说明，都是使用单体的`Eureka`注册中心进行服务注册与发现的，工程名为：`spring-cloud-eureka-server`，端口号为：1000。服务提供方工程名为：`spring-cloud-eureka-client`,应用名称为：`eureka-client`,端口号为：2000，提供了一个接口：[http://127.0.0.1:2000/hello\*\*](http://127.0.0.1:2000/hello**)

![67366013.jpg](http://qiniu.xds123.cn/18-9-20/67366013.jpg)

spring-cloud-eureka-server 示例：[spring-cloud-eureka-server](https://github.com/xie19900123/spring-cloud-learning/tree/master/spring-cloud-eureka-server)

spring-cloud-eureka-client 示例：[spring-cloud-eureka-client](https://github.com/xie19900123/spring-cloud-learning/tree/master/spring-cloud-eureka-client)

## LoadBalancerClient 实例

此类是实现客户端负载均衡的关键。本身它是个接口类，位于`spring-cloud-commons`包下，此包包含了大量的服务治理相关的抽象接口，比如已经介绍过的`DiscoveryClient`、`ServiceRegistry`以及`LoadBalancerClient实例`等等。

![74317604.jpg](http://qiniu.xds123.cn/18-9-20/74317604.jpg)

首先，我们使用最原生的方式去获取调用服务接口。

**创建个工程:\*\***`spring-cloud-eureka-consumer`\*\*

0.引入 pom 文件依赖。

```text
<!-- 客户端依赖 -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

```

1.配置文件添加相关注册中心等信息。

```text
## 服务名称
spring.application.name=eureka-consumer
## 端口号
server.port=8008

#指定注册中心地址
eureka.client.service-url.defaultZone=http://127.0.0.1:1000/eureka
# 启用ip配置 这样在注册中心列表中看见的是以ip+端口呈现的
eureka.instance.prefer-ip-address=true
# 实例名称  最后呈现地址：ip:2000
eureka.instance.instance-id=${spring.cloud.client.ip-address}:${server.port}

```

2.编写启动类，加入`@EnableDiscoveryClient`,申明为一个客户端应用,同时申明一个`RestTemplate`，最后是使用`RestTemplate`来完成 rest 服务调用的。

```text
@SpringBootApplication
@EnableDiscoveryClient
@Slf4j
public class EurekaConsumerApplication {

    public static void main(String[] args) throws Exception {
        SpringApplication.run(EurekaConsumerApplication.class, args);
        log.info("spring-cloud-eureka-consumer启动!");
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

```

3.编写一个调用类，调用`spring-cloud-eureka-client`服务提供者提供的服务。

```text
/**
 * 访问客户端示例
 * @author Hehui
 *
 */
@RestController
@Slf4j
public class DemoController {

    @Autowired
    LoadBalancerClient loadBalancerClient;

    @Autowired
    RestTemplate restTemplate;

    @GetMapping("/hello")
    public String hello(String name) {
        ServiceInstance serviceInstance = loadBalancerClient.choose("eureka-client");
        String url = "http://" + serviceInstance.getHost() + ":" + serviceInstance.getPort() + "/hello?name=" + name;
        log.info("url地址为：{}", url);
        return restTemplate.getForObject(url, String.class);
    }
}

```

4.启动应用，访问：[http://127.0.0.1:8008/hell0?name=oKong](http://127.0.0.1:8008/hell0?name=oKong) ，可以看见控制台输出了利用`LoadBalancerClient`的`choose`方法，获取到了对应`eureka-client`服务 ID 的服务地址。

![2558852.jpg](http://qiniu.xds123.cn/18-9-20/2558852.jpg)

最后通过范围对应的 http 地址进行服务请求：

![15565028.jpg](http://qiniu.xds123.cn/18-9-20/15565028.jpg)

最后浏览器上可以看见，进行了正确的访问了：

![65199797.jpg](http://qiniu.xds123.cn/18-9-20/65199797.jpg)

此时，切换到服务提供者

```text
spring-cloud-eureka-client
```

控制台，可以看见日志输出：

![70647514.jpg](http://qiniu.xds123.cn/18-9-20/70647514.jpg)

此时我们已经调用成功了，通过`LoadBalancerClient`获取到了服务提供者实际服务地址，最后进行调用。

大家可以创建多个的`spring-cloud-eureka-client`服务提供者，再去调用下，可以看见会调用不同的服务地址的。

## 客户端负载均衡 Ribbon 实例

> Spring Cloud Ribbon 是一个基于 Http 和 TCP 的客服端负载均衡工具，它是基于 Netflix Ribbon 实现的。与 Eureka 配合使用时，Ribbon 可自动从 Eureka Server (注册中心)获取服务提供者地址列表，并基于负载均衡算法，通过在客户端中配置 ribbonServerList 来设置服务端列表去轮询访问以达到均衡负载的作用。

![86401854.jpg](http://qiniu.xds123.cn/18-9-20/86401854.jpg)

上小节，简单的使用`LoadBalancerClient`进行了服务实例获取最后调用，也说了其实`LoadBalancerClient`是个接口类。而`Ribbon`实现了此接口，对应实现类为：`RibbonLoadBalancerClient`.

![40970081.jpg](http://qiniu.xds123.cn/18-9-20/40970081.jpg)

### Ribbon 实例

现在我们来看下，使用`Ribbon`的方式如何进行更加优雅的方式进行服务调用。

**创建一个工程：\*\***`spring-cloud-eureka-consumer-ribbon`\*\*
(其实这个工程和`spring-cloud-eureka-consumer`是差不多的，只是有些许不同。)

0.加入 pom 依赖

```text
<!-- 客户端依赖 -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

```

1.配置文件修改，添加注册中心等相关信息。

```text
spring.application.name=eureka-consumer-ribbon
server.port=8018

#指定注册中心地址
eureka.client.service-url.defaultZone=http://127.0.0.1:1000/eureka
# 启用ip配置 这样在注册中心列表中看见的是以ip+端口呈现的
eureka.instance.prefer-ip-address=true
# 实例名称  最后呈现地址：ip:2000
eureka.instance.instance-id=${spring.cloud.client.ip-address}:${server.port}

```

2.编写启动类，加入`@EnableDiscoveryClient`，同时申明一个`RestTemplate`，**这里和原先不同，就在于加入了\*\***`@LoadBalanced`\***\*注解进行修饰\*\***`RestTemplate`\***\*类，稍后会大致讲解下是如何进行实现的。**

```text
@SpringBootApplication
@EnableDiscoveryClient
@Slf4j
public class EurekaConsumerRibbonApplication {

    public static void main(String[] args) throws Exception {
        SpringApplication.run(EurekaConsumerRibbonApplication.class, args);
        log.info("spring-cloud-eureka-consumer-ribbon启动!");
    }

    //添加 @LoadBalanced 使其具备了使用LoadBalancerClient 进行负载均衡的能力
    @Bean
    @LoadBalanced
    public RestTemplate restTemplage() {
        return new RestTemplate();
    }
}

```

3.编写测试类，进行服务调用。

```text
/**
 * ribbon访问客户端示例
 * @author Hehui
 *
 */
@RestController
@Slf4j
public class DemoController {

    @Autowired
    RestTemplate restTemplate;

    @GetMapping("/hello")
    public String hello(String name) {
        //直接使用服务名进行访问
        log.info("请求参数name:{}", name);
        return restTemplate.getForObject("<http://eureka-client/hello?name=>" + name, String.class);
    }
}

```

可以看见，可以直接注入`RestTemplate`，通过服务名直接调用.

4.启动应用，访问:[http://127.0.0.1:8018/hello?name=oKong](http://127.0.0.1:8018/hello?name=oKong) ,可以看见调用成功：

![20652450.jpg](http://qiniu.xds123.cn/18-9-20/20652450.jpg)

控制台输出：

![75877117.jpg](http://qiniu.xds123.cn/18-9-20/75877117.jpg)

### 简单聊聊 LoadBalanced 注解

> 可以从以上示例中，可以看出，我们就加了一个@LoadBalanced 注解修饰 RestTemplatebean 类，就实现了服务的调用。现在来简单看看具体是如何实现的。

首先，我们看看此注解的代码说明：

![55952682.jpg](http://qiniu.xds123.cn/18-9-20/55952682.jpg)

从注释可以看出，该注解用来给 RestTemplate 做标记，以使用负载均衡的客户端`LoadBalancerClient`。

现在来看一眼相同包下的类的情况，可以看到有个`LoadBalancerAutoConfiguration`,字面意思可以知道这是一个自动配置类，此类就是我们要找的关键类了。

![33505933.jpg](http://qiniu.xds123.cn/18-9-20/33505933.jpg)

`LoadBalancerAutoConfiguration`,此类不长，一百来行，这里就不贴了。

![6039671.jpg](http://qiniu.xds123.cn/18-9-20/6039671.jpg)

简单说明下：
首先，此类生效的条件是

```text
@ConditionalOnClass(RestTemplate.class)
@ConditionalOnBean(LoadBalancerClient.class)

```

- `RestTemplate`类必须存在于当前工程的环境中。
- 在 Spring 的 Bean 工程中有必须有`LoadBalancerClient`的实现 Bean。

该自动化配置类中，主要做了几件事情：

- 维护了一个被@LoadBalanced 注解修饰的 RestTemplate 对象列表

```text
@LoadBalanced
    @Autowired(required = false)
    private List<RestTemplate> restTemplates = Collections.emptyList();

```

同时为其每个对象通过调用`RestTemplateCustomizer`添加了一个`LoadBalancerInterceptor`和`RetryLoadBalancerInterceptor`拦截器(有生效条件)，其为`ClientHttpRequestInterceptor`接口的实现类，`ClientHttpRequestInterceptor`是`RestTemplate`的请求拦截器

![75808703.jpg](http://qiniu.xds123.cn/18-9-20/75808703.jpg)

**RetryLoadBalancerInterceptor 拦截器**

![63370995.jpg](http://qiniu.xds123.cn/18-9-20/63370995.jpg)

**LoadBalancerInterceptor 拦截器**

![84887976.jpg](http://qiniu.xds123.cn/18-9-20/84887976.jpg)

我们主要看下`LoadBalancerInterceptor`：

![73056978.jpg](http://qiniu.xds123.cn/18-9-21/73056978.jpg)

可以看见，最后是实现了`ClientHttpRequestInterceptor`接口的实现类执行`execute`方法进行.

![82979252.jpg](http://qiniu.xds123.cn/18-9-21/82979252.jpg)

从继承关系里，此实现类就是`RibbonLoadBalancerClient`类了。

![59541189.jpg](http://qiniu.xds123.cn/18-9-21/59541189.jpg)

```text
RibbonLoadBalancerClient
```

类：

![13645724.jpg](http://qiniu.xds123.cn/18-9-21/13645724.jpg)

简单来说：最后还是通过`loadBalancerClient.choose()`获取到服务实例，最通过拼凑 http 地址来进行最后的服务调用。

**总体来说，就是通过为加入\*\***`@LoadBalanced`\***\*注解的\*\***`RestTemplate`\***\*添加一个请求拦截器，在请求前通过拦截器获取真正的请求地址，最后进行服务调用。**

里面的细节就不阐述了，毕竟源码分析不是很在行呀，大家可以跟踪进去一探究竟吧。

**友情提醒：若被\*\***`@LoadBalanced`\***\*注解的\*\***`RestTemplate`\***\*访问正常的服务地址，如\*\***`http://127.0.0.1:8080/hello`\***\*时，是会提示无法找到此服务的。**

具体原因：`serverid`必须是我们访问的`服务名称` ，当我们直接输入`ip`的时候获取的`server`是`null`，就会抛出异常。

![95656166.jpg](http://qiniu.xds123.cn/18-9-21/95656166.jpg)

此时，**若是需要调用非注册中心的服务，可以创建一个不被\*\***`@LoadBalanced`\***\*注解的\*\***`RestTemplate`\***\*,同时指定 bean 的名称，使用时，使用\*\***`@Qualifier`\***\*指定 name 注入此\*\***`RestTemplate`\***\*。**

```text
    @Bean("normalRestTemplage")
    public RestTemplate normalRestTemplage() {
        return new RestTemplate();
    }

    //使用
    @Autowired
    @Qualifier("normalRestTemplage")
    RestTemplate normalRestTemplate;

     @GetMapping("/ip")
    public String ip(String name) {
        //直接使用服务名进行访问
        log.info("使用ip请求，请求参数name:{}", name);
        return normalRestTemplate.getForObject("<http://127.0.0.1:2000/hello?name=>" + name, String.class);
    }

```

### 负载均衡器

目前还未进行过自定义负载均衡，这里就简单的举例下，上次整理 ppt 时有讲过一些，但未深入了解过 ⊙﹏⊙‖∣，

![6181280.jpg](http://qiniu.xds123.cn/18-9-21/6181280.jpg)

可以从继承关系看出，是通过继承`IRule`来实现的。

![39759685.jpg](http://qiniu.xds123.cn/18-9-21/39759685.jpg)

**可继承 ClientConfigEnabledRoundRobinRule，来实现自己负载均衡策略。**

## 声明式服务 Feign 实例

从上一章节，我们知道，当我们要调用一个服务时，需要知道服务名和 api 地址，这样才能进行服务调用，服务少时，这样写觉得没有什么问题，但当服务一多，接口参数很多时，上面的写法就显得不够优雅了。所以，接下来，来说说一种更好更优雅的调用服务的方式：**Feign**。

> Feign 是 Netflix 开发的声明式、模块化的 HTTP 客户端。Feign 可帮助我们更好更快的便捷、优雅地调用 HTTP API。

在`Spring Cloud`中，使用`Feign`非常简单——创建一个接口，并在接口上添加一些注解。`Feign`支持多种注释，例如 Feign 自带的注解或者 JAX-RS 注解等
Spring Cloud 对 Feign 进行了增强，使 Feign 支持了 Spring MVC 注解，并整合了 Ribbon 和 Eureka,从而让 Feign 的使用更加方便。**只需要通过创建接口并用注解来配置它既可完成对 Web 服务接口的绑定。**

### Feign 实例

**创建个\*\***`spring-cloud-eureka-consumer-ribbon`\***\*工程项目。**

0.加入`feigin`依赖

```text
        <!-- feign -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>
        <!-- eureka客户端依赖 -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        <!-- rest api -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

```

1.配置文件

```text
spring.application.name=eureka-consumer-feign
server.port=8028

#指定注册中心地址
eureka.client.service-url.defaultZone=http://127.0.0.1:1000/eureka
# 启用ip配置 这样在注册中心列表中看见的是以ip+端口呈现的
eureka.instance.prefer-ip-address=true
# 实例名称  最后呈现地址：ip:2000
eureka.instance.instance-id=${spring.cloud.client.ip-address}:${server.port}

```

2.创建启动类，加入注解`@EnableFeignClients`，开启`feign`支持。

```text
@SpringBootApplication
@EnableFeignClients
@Slf4j
public class EurekaConsumerFeignApplication {

    public static void main(String[] args) throws Exception {
        SpringApplication.run(EurekaConsumerFeignApplication.class, args);
        log.info("spring-cloud-eureka-consumer-feign启动");
    }

}

```

3.创建一个接口类`IHelloClient`,加入注解`@FeignClient`来指定这个接口所要调用的服务名称。

```text
@FeignClient(name="eureka-client")
public interface IHelloClient {

    /**
     * 定义接口
     * @param name
     * @return
     */
    @RequestMapping(value="/hello", method=RequestMethod.GET)
    public String hello(@RequestParam("name") String name);
}

```

4.创建一个 demo 控制层，引入此接口类。

```text
/**
 * feign 示例
 * @author Hehui
 *
 */
@RestController
@Slf4j
public class DemoController {

    @Autowired
    IHelloClient helloClient;

    @GetMapping("/hello")
    public String hello(String name) {
        log.info("使用feign调用服务，参数name:{}", name);
        return helloClient.hello(name);
    }
}

```

5.启动应用，访问：[http://127.0.0.1:8028/hello?name=Hehui-feign](http://127.0.0.1:8028/hello?name=Hehui-feign)

![99970618.jpg](http://qiniu.xds123.cn/18-9-21/99970618.jpg)

**是不是很简单，和调用本地服务是一样的了！**

### Feign 继承特性

> Feign 支持继承，但不支持多继承。使用继承，可将一些公共操作分组到一些父类接口中，从而简化 Feign 的开发。

**所以在实际开发中，调用服务接口时，可直接按接口类和实现类进行编写，调用方引入接口依赖，继承一个本地接口，这样接口方法默认都是定义好的，也少了很多编码量。用起来就更爽了，就是有点依赖性，对方服务修改后需要同步更新下，但这个团队内部约定下问题不大的**

这里简单实例下，创建一个`spring-cloud-eureka-client-api`工程。

0.加入依赖，注意此依赖的作用范围：

```text
    <!--api接口依赖-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <scope>provided</scope>
        </dependency>

```

1.编写一个接口类`IHellpApi`：

```text
public interface IHelloApi {
    //定义提供者服务名
    public static final String SERVICE_NAME = "eureka-client";

    /**
     * 定义接口
     * @param name
     * @return
     */
    @RequestMapping(value="/hello", method=RequestMethod.GET)
    public String hello(@RequestParam("name") String name);
}

```

**修改\*\***`spring-cloud-eureka-client`\***\*工程**

0.引入 api 依赖

```text
    <!-- 导入接口依赖 -->
    <dependency>
       <groupId>cn.lqdev.learning</groupId>
       <artifactId>spring-cloud-eureka-client-api</artifactId>
       <version>0.0.1-SNAPSHOT</version>
    </dependency>

```

1.创建一个`HelloApiImpl`类，实现`IHelloApi`:

```text
/**
 * 使用接口方式进行接口编写
 * @author Hehui
 *
 */
@RestController
@Slf4j
public class HelloApiImpl implements IHelloApi {

    @Override
    public String helloApi(@RequestParam("name") String name) {
        log.info("[spring-cloud-eureka-client]服务[helloApi]被调用，参数name值为：{}", name);
        return name + ",helloApi调用!";
    }
}

```

**此时，\*\***`HelloApiImpl`\***\*是个控制层也是个接口实现类了。**

**修改\*\***`spring-cloud-eureka-consumer-feign`\***\*工程。** 0.引入 api 依赖

```text
    <!-- 导入接口依赖 -->
    <dependency>
       <groupId>cn.lqdev.learning</groupId>
       <artifactId>spring-cloud-eureka-client-api</artifactId>
       <version>0.0.1-SNAPSHOT</version>
    </dependency>

```

1.同样创建一个接口，使其继承`IHelloApi`:

```text
/**
 * 直接继承接口
 * @author Hehui
 *
 */
@FeignClient(name = IHelloApi.SERVICE_NAME)
public interface HelloApi extends IHelloApi{

}

```

**小技巧：可以在\*\***`IHelloApi`\***\*定义一个服务名变量，如：SERVICE_NAME，这样让提供者进行变量的赋值，可以避免一些不必要的交流成本的，若有变化，服务调用方也无需关心的。一切都是约定编程！**

2.修改下`DemoController`类，注入`HelloApi`：

```text
    @Autowired
    HelloApi helloApi;

    @GetMapping("hello2")
    public String hello2(String name) {
        log.info("使用feign继承方式调用服务，参数name:{}", name);
        return helloApi.helloApi(name);
    }

```

3.分别启动各服务，访问：[http://127.0.0.1:8028/hello2?name=oKong-api](http://127.0.0.1:8028/hello2?name=oKong-api)

![10151632.jpg](http://qiniu.xds123.cn/18-9-21/10151632.jpg)

使用起来没啥差别的，一样的调用，**但对于调用方而言，可以无需去理会具体细节了，照着接口方法去传参就好了。**

**这种方式，和原来的\*\***`dubbo`\***\*调用的方式是类似的，简单方便。大家可以把接口和实体放入一个包中，调用者和提供者都进行依赖即可。**

### 注意事项

在使用`Feign`时，会碰见一些问题，为了避免不必要的错误，以下这些需要额外注意下。

- GET 请求多个参数时，需要使用@RequestParam
- GET 请求参数为实体时，会自动转换成 POST 请求
- POST 请求使用@RequestBody 注解参数
- 不建议直接将@RequestMapping 注解在类上，直接写在方法上

## 参考资料

1. [https://blog.csdn.net/mengdonghui123456/article/details/53981976](https://blog.csdn.net/mengdonghui123456/article/details/53981976)
2. [https://cloud.spring.io/spring-cloud-static/Finchley.SR1/single/spring-cloud.html#\_spring_cloud_openfeign](https://cloud.spring.io/spring-cloud-static/Finchley.SR1/single/spring-cloud.html#_spring_cloud_openfeign)

## 总结

> 本章节主要讲解了下服务消费者如何利用原生、ribbon、fegin 三种方式进行服务调用的，其实每种调用方式都是使用 ribbon 来进行调用的，只是有些进行了增强，是的使用起来更简单高效而已。对于其原理的实现，本文未进行详细阐述，大家可以谷歌想相关知识，跟踪下源码了解下，本人也尚未深入研究过，还是停留在使用阶段，之后有时间了看一看，有啥心得再来分享吧。此时若服务上线下线，调用者调用可能会出现短暂的调用异常，最常见的就是找不到服务，此时服务容错保护就排上用场了，所以下一章节，就来说说关于服务容错保护相关知识点~

# @LoadBalanced 注解与 RestTemplate

在`Spring Cloud`微服务应用体系中，远程调用都应负载均衡。我们在使用`RestTemplate`作为远程调用客户端的时候，开启负载均衡极其简单：**一个\*\***`@LoadBalanced`\***\*注解就搞定了**。
相信大家大都使用过`Ribbon`做**Client 端**的负载均衡，也许你有和我一样的感受：**Ribbon 虽强大但不是特别的好用**。我研究了一番，其实根源还是我们对它内部的原理不够了解，导致对一些现象无法给出合理解释，同时也影响了我们对它的**定制和扩展**。本文就针对此做出梳理，希望大家通过本文也能够对`Ribbon`有一个较为清晰的理解（本文只解释它`@LoadBalanced`这一小块内容）。

开启客户端负载均衡只需要一个注解即可，形如这样：

```text
@LoadBalanced // 标注此注解后，RestTemplate就具有了客户端负载均衡能力
@Bean
public RestTemplate restTemplate(){
    return new RestTemplate();
}

```

说`Spring`是 Java 界最优秀、最杰出的重复发明轮子作品一点都不为过。本文就代领你一探究竟，为何开启`RestTemplate`的负载均衡如此简单。

> 说明：本文建立在你已经熟练使用 RestTemplate，并且了解 RestTemplate 它相关组件的原理的基础上分析。若对这部分还比较模糊，强行推荐你先参看我前面这篇文章：RestTemplate 的使用和原理你都烂熟于胸了吗？【享学 Spring MVC】

## RibbonAutoConfiguration

这是`Spring Boot/Cloud`启动`Ribbon`的入口自动配置类，需要先有个大概的了解：

```text
@Configuration
// 类路径存在com.netflix.client.IClient、RestTemplate等时生效
@Conditional(RibbonAutoConfiguration.RibbonClassesConditions.class)
// // 允许在单个类中使用多个@RibbonClient
@RibbonClients
// 若有Eureka，那就在Eureka配置好后再配置它~~~（如果是别的注册中心呢，ribbon还能玩吗？）
@AutoConfigureAfter(name = "org.springframework.cloud.netflix.eureka.EurekaClientAutoConfiguration")
@AutoConfigureBefore({ LoadBalancerAutoConfiguration.class, AsyncLoadBalancerAutoConfiguration.class })
// 加载配置：ribbon.eager-load --> true的话，那么项目启动的时候就会把Client初始化好，避免第一次惩罚
@EnableConfigurationProperties({ RibbonEagerLoadProperties.class, ServerIntrospectorProperties.class })
public class RibbonAutoConfiguration {

    @Autowired
    private RibbonEagerLoadProperties ribbonEagerLoadProperties;
    // Ribbon的配置文件们~~~~~~~（复杂且重要）
    @Autowired(required = false)
    private List<RibbonClientSpecification> configurations = new ArrayList<>();

    // 特征，FeaturesEndpoint这个端点(`/actuator/features`)会使用它org.springframework.cloud.client.actuator.HasFeatures
    @Bean
    public HasFeatures ribbonFeature() {
        return HasFeatures.namedFeature("Ribbon", Ribbon.class);
    }


    // 它是最为重要的，是一个org.springframework.cloud.context.named.NamedContextFactory  此工厂用于创建命名的Spring容器
    // 这里传入配置文件，每个不同命名空间就会创建一个新的容器（和Feign特别像） 设置当前容器为父容器
    @Bean
    public SpringClientFactory springClientFactory() {
        SpringClientFactory factory = new SpringClientFactory();
        factory.setConfigurations(this.configurations);
        return factory;
    }

    // 这个Bean是关键，若你没定义，就用系统默认提供的Client了~~~
    // 内部使用和持有了SpringClientFactory。。。
    @Bean
    @ConditionalOnMissingBean(LoadBalancerClient.class)
    public LoadBalancerClient loadBalancerClient() {
        return new RibbonLoadBalancerClient(springClientFactory());
    }
    ...
}

```

这个配置类最重要的是完成了`Ribbon`相关组件的自动配置，有了`LoadBalancerClient`才能做负载均衡（这里使用的是它的唯一实现类`RibbonLoadBalancerClient`）

---

## @LoadBalanced

注解本身及其简单（一个属性都木有）：

```text
// 所在包是org.springframework.cloud.client.loadbalancer
// 能标注在字段、方法参数、方法上
// JavaDoc上说得很清楚：它只能标注在RestTemplate上才有效
@Target({ ElementType.FIELD, ElementType.PARAMETER, ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@Qualifier
public @interface LoadBalanced {
}

```

它最大的特点：头上标注有`@Qualifier`注解，这是它生效的最重要因素之一，本文后半啦我花了大篇幅介绍它的生效时机。
关于`@LoadBalanced`自动生效的配置，我们需要来到这个自动配置类：`LoadBalancerAutoConfiguration`

### LoadBalancerAutoConfiguration

```text
// Auto-configuration for Ribbon (client-side load balancing).
// 它的负载均衡技术依赖于的是Ribbon组件~
// 它所在的包是：org.springframework.cloud.client.loadbalancer
@Configuration
@ConditionalOnClass(RestTemplate.class) //可见它只对RestTemplate生效
@ConditionalOnBean(LoadBalancerClient.class) // Spring容器内必须存在这个接口的Bean才会生效（参见：RibbonAutoConfiguration）
@EnableConfigurationProperties(LoadBalancerRetryProperties.class) // retry的配置文件
public class LoadBalancerAutoConfiguration {

    // 拿到容器内所有的标注有@LoadBalanced注解的Bean们
    // 注意：必须标注有@LoadBalanced注解的才行
    @LoadBalanced
    @Autowired(required = false)
    private List<RestTemplate> restTemplates = Collections.emptyList();
    // LoadBalancerRequestTransformer接口：允许使用者把request + ServiceInstance --> 改造一下
    // Spring内部默认是没有提供任何实现类的（匿名的都木有）
    @Autowired(required = false)
    private List<LoadBalancerRequestTransformer> transformers = Collections.emptyList();

    // 配置一个匿名的SmartInitializingSingleton 此接口我们应该是熟悉的
    // 它的afterSingletonsInstantiated()方法会在所有的单例Bean初始化完成之后，再调用一个一个的处理BeanName~
    // 本处：使用配置好的所有的RestTemplateCustomizer定制器们，对所有的`RestTemplate`定制处理
    // RestTemplateCustomizer下面有个lambda的实现。若调用者有需要可以书写然后扔进容器里既生效
    // 这种定制器：若你项目中有多个RestTempalte，需要统一处理的话。写一个定制器是个不错的选择
    // （比如统一要放置一个请求拦截器：输出日志之类的）
    @Bean
    public SmartInitializingSingleton loadBalancedRestTemplateInitializerDeprecated(final ObjectProvider<List<RestTemplateCustomizer>> restTemplateCustomizers) {
        return () -> restTemplateCustomizers.ifAvailable(customizers -> {
            for (RestTemplate restTemplate : LoadBalancerAutoConfiguration.this.restTemplates) {
                for (RestTemplateCustomizer customizer : customizers) {
                    customizer.customize(restTemplate);
                }
            }
        });
    }

    // 这个工厂用于createRequest()创建出一个LoadBalancerRequest
    // 这个请求里面是包含LoadBalancerClient以及HttpRequest request的
    @Bean
    @ConditionalOnMissingBean
    public LoadBalancerRequestFactory loadBalancerRequestFactory(LoadBalancerClient loadBalancerClient) {
        return new LoadBalancerRequestFactory(loadBalancerClient, this.transformers);
    }

    // =========到目前为止还和负载均衡没啥关系==========
    // =========接下来的配置才和负载均衡有关（当然上面是基础项）==========

    // 若有Retry的包，就是另外一份配置，和这差不多~~
    @Configuration
    @ConditionalOnMissingClass("org.springframework.retry.support.RetryTemplate")
    static class LoadBalancerInterceptorConfig {、

        // 这个Bean的名称叫`loadBalancerClient`，我个人觉得叫`loadBalancerInterceptor`更合适吧（虽然ribbon是唯一实现）
        // 这里直接使用的是requestFactory和Client构建一个拦截器对象
        // LoadBalancerInterceptor可是`ClientHttpRequestInterceptor`，它会介入到http.client里面去
        // LoadBalancerInterceptor也是实现负载均衡的入口，下面详解
        // Tips:这里可没有@ConditionalOnMissingBean哦~~~~
        @Bean
        public LoadBalancerInterceptor ribbonInterceptor(LoadBalancerClient loadBalancerClient, LoadBalancerRequestFactory requestFactory) {
            return new LoadBalancerInterceptor(loadBalancerClient, requestFactory);
        }


        // 向容器内放入一个RestTemplateCustomizer 定制器
        // 这个定制器的作用上面已经说了：在RestTemplate初始化完成后，应用此定制化器在**所有的实例上**
        // 这个匿名实现的逻辑超级简单：向所有的RestTemplate都塞入一个loadBalancerInterceptor 让其具备有负载均衡的能力

        // Tips：此处有注解@ConditionalOnMissingBean。也就是说如果调用者自己定义过RestTemplateCustomizer类型的Bean，此处是不会执行的
        // 请务必注意这点：容易让你的负载均衡不生效哦~~~~
        @Bean
        @ConditionalOnMissingBean
        public RestTemplateCustomizer restTemplateCustomizer(final LoadBalancerInterceptor loadBalancerInterceptor) {
            return restTemplate -> {
                List<ClientHttpRequestInterceptor> list = new ArrayList<>(restTemplate.getInterceptors());
                list.add(loadBalancerInterceptor);
                restTemplate.setInterceptors(list);
            };
        }
    }
    ...
}

```

这段配置代码稍微有点长，我把流程总结为如下几步：

1. `LoadBalancerAutoConfiguration`要想生效类路径必须有`RestTemplate`，以及 Spring 容器内必须有`LoadBalancerClient`的实现 Bean
   \1. `LoadBalancerClient`的唯一实现类是：`org.springframework.cloud.netflix.ribbon.RibbonLoadBalancerClient`
2. `LoadBalancerInterceptor`是个`ClientHttpRequestInterceptor`客户端请求拦截器。它的作用是在客户端发起请求之前拦截，**进而实现客户端的负载均衡**
3. `restTemplateCustomizer()`返回的匿名定制器`RestTemplateCustomizer`它用来给所有的`RestTemplate`加上负载均衡拦截器（需要注意它的`@ConditionalOnMissingBean`注解~）

不难发现，负载均衡实现的核心就是一个拦截器，就是这个拦截器让一个普通的`RestTemplate`逆袭成为了一个具有负载均衡功能的请求器

### `LoadBalancerInterceptor`

该类唯一被使用的地方就是`LoadBalancerAutoConfiguration`里配置上去~

```text
public class LoadBalancerInterceptor implements ClientHttpRequestInterceptor {

    // 这个命名都不叫Client了，而叫loadBalancer~~~
    private LoadBalancerClient loadBalancer;
    // 用于构建出一个Request
    private LoadBalancerRequestFactory requestFactory;
    ... // 省略构造函数（给这两个属性赋值）

    @Override
    public ClientHttpResponse intercept(final HttpRequest request, final byte[] body, final ClientHttpRequestExecution execution) throws IOException {
        final URI originalUri = request.getURI();
        String serviceName = originalUri.getHost();
        Assert.state(serviceName != null, "Request URI does not contain a valid hostname: " + originalUri);
        return this.loadBalancer.execute(serviceName, this.requestFactory.createRequest(request, body, execution));
    }
}

```

此拦截器拦截请求后把它的`serviceName`委托给了`LoadBalancerClient`去执行，根据`ServiceName`可能对应 N 多个实际的`Server`，因此就可以从众多的 Server 中运用均衡算法，挑选出一个最为合适的`Server`做最终的请求（它持有真正的请求执行器`ClientHttpRequestExecution`）。

---

### LoadBalancerClient

请求被拦截后，最终都是委托给了`LoadBalancerClient`处理。

```text
// 由使用负载平衡器选择要向其发送请求的服务器的类实现
public interface ServiceInstanceChooser {

    // 从负载平衡器中为指定的服务选择Service服务实例。
    // 也就是根据调用者传入的serviceId，负载均衡的选择出一个具体的实例出来
    ServiceInstance choose(String serviceId);
}

// 它自己定义了三个方法
public interface LoadBalancerClient extends ServiceInstanceChooser {

    // 执行请求
    <T> T execute(String serviceId, LoadBalancerRequest<T> request) throws IOException;
    <T> T execute(String serviceId, ServiceInstance serviceInstance, LoadBalancerRequest<T> request) throws IOException;

    // 重新构造url：把url中原来写的服务名 换掉 换成实际的
    URI reconstructURI(ServiceInstance instance, URI original);
}

```

它只有一个实现类`RibbonLoadBalancerClient`（`ServiceInstanceChooser`是有多个实现类的~）。

### `RibbonLoadBalancerClient`

首先我们应当关注它的`choose()`方法：

```text
public class RibbonLoadBalancerClient implements LoadBalancerClient {

    @Override
    public ServiceInstance choose(String serviceId) {
        return choose(serviceId, null);
    }
    // hint：你可以理解成分组。若指定了，只会在这个偏好的分组里面去均衡选择
    // 得到一个Server后，使用RibbonServer把server适配起来~~~
    // 这样一个实例就选好了~~~真正请求会落在这个实例上~
    public ServiceInstance choose(String serviceId, Object hint) {
        Server server = getServer(getLoadBalancer(serviceId), hint);
        if (server == null) {
            return null;
        }
        return new RibbonServer(serviceId, server, isSecure(server, serviceId),
                serverIntrospector(serviceId).getMetadata(server));
    }

    // 根据ServiceId去找到一个属于它的负载均衡器
    protected ILoadBalancer getLoadBalancer(String serviceId) {
        return this.clientFactory.getLoadBalancer(serviceId);
    }

}

```

`choose方法`：传入 serviceId，然后通过`SpringClientFactory`获取负载均衡器`com.netflix.loadbalancer.ILoadBalancer`，最终委托给它的`chooseServer()`方法选取到一个`com.netflix.loadbalancer.Server`实例，也就是说真正完成`Server`选取的是`ILoadBalancer`。

> ILoadBalancer 以及它相关的类是一个较为庞大的体系，本文不做更多的展开，而是只聚焦在我们的流程上

`LoadBalancerInterceptor`执行的时候是直接委托执行的`loadBalancer.execute()`这个方法：

```text
RibbonLoadBalancerClient：

    // hint此处传值为null：一视同仁
    // 说明：LoadBalancerRequest是通过LoadBalancerRequestFactory.createRequest(request, body, execution)创建出来的
    // 它实现LoadBalancerRequest接口是用的一个匿名内部类，泛型类型是ClientHttpResponse
    // 因为最终执行的显然还是执行器：ClientHttpRequestExecution.execute()
    @Override
    public <T> T execute(String serviceId, LoadBalancerRequest<T> request) throws IOException {
        return execute(serviceId, request, null);
    }
    // public方法（非接口方法）
    public <T> T execute(String serviceId, LoadBalancerRequest<T> request, Object hint) throws IOException {
        // 同上：拿到负载均衡器，然后拿到一个serverInstance实例
        ILoadBalancer loadBalancer = getLoadBalancer(serviceId);
        Server server = getServer(loadBalancer, hint);
        if (server == null) { // 若没找到就直接抛出异常。这里使用的是IllegalStateException这个异常
            throw new IllegalStateException("No instances available for " + serviceId);
        }

        // 把Server适配为RibbonServer  isSecure：客户端是否安全
        // serverIntrospector内省  参考配置文件：ServerIntrospectorProperties
        RibbonServer ribbonServer = new RibbonServer(serviceId, server,
                isSecure(server, serviceId), serverIntrospector(serviceId).getMetadata(server));

        //调用本类的重载接口方法~~~~~
        return execute(serviceId, ribbonServer, request);
    }

    // 接口方法：它的参数是ServiceInstance --> 已经确定了唯一的Server实例~~~
    @Override
    public <T> T execute(String serviceId, ServiceInstance serviceInstance, LoadBalancerRequest<T> request) throws IOException {

        // 拿到Server）（说白了，RibbonServer是execute时的唯一实现）
        Server server = null;
        if (serviceInstance instanceof RibbonServer) {
            server = ((RibbonServer) serviceInstance).getServer();
        }
        if (server == null) {
            throw new IllegalStateException("No instances available for " + serviceId);
        }

        // 说明：执行的上下文是和serviceId绑定的
        RibbonLoadBalancerContext context = this.clientFactory.getLoadBalancerContext(serviceId);
        ...
        // 真正的向server发送请求，得到返回值
        // 因为有拦截器，所以这里肯定说执行的是InterceptingRequestExecution.execute()方法
        // so会调用ServiceRequestWrapper.getURI()，从而就会调用reconstructURI()方法
            T returnVal = request.apply(serviceInstance);
            return returnVal;
        ... // 异常处理
    }

```

`returnVal`是一个`ClientHttpResponse`，最后交给`handleResponse()`方法来处理异常情况（若存在的话），若无异常就交给提取器提值：`responseExtractor.extractData(response)`，这样整个请求就算全部完成了。

### 使用细节

针对`@LoadBalanced`下的`RestTemplate`的使用，我总结如下细节供以参考：

1. 传入的`String`类型的 url 必须是绝对路径（`http://...`），否则抛出异常：`java.lang.IllegalArgumentException: URI is not absolute`
2. `serviceId`不区分大小写（`http://user/...效果同http://USER/...`）
3. `serviceId`后请不要跟 port 端口号了~~~

最后，需要特别指出的是：标注有`@LoadBalanced`的`RestTemplate`只能书写`serviceId`而不能再写`IP地址/域名`去发送请求了。若你的项目中两种 case 都有需要，请定义多个`RestTemplate`分别应对不同的使用场景~

### 本地测试

了解了它的执行流程后，若需要本地测试（不依赖于注册中心），可以这么来做：

```text
// 因为自动配置头上有@ConditionalOnMissingBean注解，所以自定义一个覆盖它的行为即可
// 此处复写它的getServer()方法，返回一个固定的（访问百度首页）即可，方便测试
@Bean
public LoadBalancerClient loadBalancerClient(SpringClientFactory factory) {
    return new RibbonLoadBalancerClient(factory) {
        @Override
        protected Server getServer(ILoadBalancer loadBalancer, Object hint) {
            return new Server("www.baidu.com", 80);
        }
    };
}

```

这么一来，下面这个访问结果就是百度首页的 html 内容喽。

```text
@Test
public void contextLoads() {
    String obj = restTemplate.getForObject("<http://my-serviceId>", String.class);
    System.out.println(obj);
}

```

> 此处 my-serviceId 肯定是不存在的，但得益于我上面自定义配置的 LoadBalancerClient

什么，写死`return`一个`Server`实例不优雅？确实，总不能每次上线前还把这部分代码给注释掉吧，若有多个实例呢？还得自己写负载均衡算法吗？很显然`Spring Cloud`早早就为我们考虑到了这一点：**脱离 Eureka 使用配置 listOfServers 进行客户端负载均衡调度（\*\***`<clientName>.<nameSpace>.listOfServers=<comma delimited hostname:port strings>`\***\*）**

对于上例我只需要在主配置文件里这么配置一下：

```text
# ribbon.eureka.enabled=false # 若没用euraka，此配置可省略。否则不可以
my-serviceId.ribbon.listOfServers=www.baidu.com # 若有多个实例请用逗号分隔

```

效果完全同上。

> Tips：这种配置法不需要是完整的绝对路径，http://是可以省略的（new Server()方式亦可）

### 自己添加一个记录请求日志的拦截器可行吗？

显然是可行的，我给出示例如下：

```text
@LoadBalanced
@Bean
public RestTemplate restTemplate() {
    RestTemplate restTemplate = new RestTemplate();
    List<ClientHttpRequestInterceptor> list = new ArrayList<>();
    list.add((request, body, execution) -> {
        System.out.println("当前请求的URL是：" + request.getURI().toString());
        return execution.execute(request, body);
    });
    restTemplate.setInterceptors(list);
    return restTemplate;
}

```

这样每次客户端的请求都会打印这句话：`当前请求的URI是：<http://my-serviceId`>，一般情况（缺省情况）自定义的拦截器都会在负载均衡拦截器前面执行（因为它要执行最终的请求）。若你有必要定义多个拦截器且要控制顺序，可通过`Ordered`系列接口来实现~

---

**最后的最后，我抛出一个非常非常重要的问题：**

```text
    @LoadBalanced
    @Autowired(required = false)
    private List<RestTemplate> restTemplates = Collections.emptyList();

```

`@Autowired` + `@LoadBalanced`能把你配置的`RestTemplate`自动注入进来拿来定制呢？？？核心原理是什么？

## > 提示：本原理内容属于`Spring Framwork`核心技术，建议深入思考而不囫囵吞枣。有疑问的可以给我留言，我也将会在下篇文章给出详细解答（建议先思考）

### 推荐阅读

[RestTemplate 的使用和原理你都烂熟于胸了吗？【享学 Spring MVC】](https://fangshixiang.blog.csdn.net/article/details/100753981)[@Qualifier 高级应用---按类别批量依赖注入【享学 Spring】](https://fangshixiang.blog.csdn.net/article/details/100890879)

\------------------------------------------------------

# Ribbon 是如何通过一个@LoadBalanced 注解就实现负载均衡的

原创[绅士 jiejie](https://me.csdn.net/weixin_38106322) 最后发布于 2019-11-08 15:09:04 阅读数 94 收藏

发布于 2019-11-06 16:14:45

分类专栏： [Spring Cloud](https://blog.csdn.net/weixin_38106322/category_9431347.html)

版权声明：本文为博主原创文章，遵循[ CC 4.0 BY-SA ](http://creativecommons.org/licenses/by-sa/4.0/)版权协议，转载请附上原文出处链接和本声明。

本文链接：[https://blog.csdn.net/weixin_38106322/article/details/102937313](https://blog.csdn.net/weixin_38106322/article/details/102937313)

展开

一.介绍下测试用到的服务

![20191106161350811.png](https://img-blog.csdnimg.cn/20191106161350811.png)

从 Eureka 注册中心中可以可以看出有 EUREKA-CLIENT 和 RIBBON-CLIENT 的服务，其中 EUREKA-CLIENT 有两个节点作为服务提供者，而 RIBBON-CLIENT 则是服务消费者，通过 RestTemplate 来消费 EUREKA-CLIENT 的服务。

下面代码就是简单实现 Ribbon 负载均衡的配置类：

```text
@Configuration
public class RibbonConfig {

    @Bean
    @LoadBalanced
    RestTemplate getRestTemlate() {
        return new RestTemplate();
    }
}

```

这样简单的通过一个@LoadBalanced 注解在 RestTemplate 上 ，在 RestTemplate 远程调用的时候，就会出现负载均衡的效果。

二.一步一步理清 Ribbon 负载均衡的逻辑

1. 首先全局搜索@LoadBalanced 这个注解，发现在 LoadBalancerAutoConfiguration 类有用到该注解：

```text
@Configuration
@ConditionalOnClass(RestTemplate.class)
@ConditionalOnBean(LoadBalancerClient.class)
@EnableConfigurationProperties(LoadBalancerRetryProperties.class)
public class LoadBalancerAutoConfiguration {

    /**
    *  这段代码的作用是将有用@LoadBalanced注解的RestTemplate注入
    */
	@LoadBalanced
	@Autowired(required = false)
	private List<RestTemplate> restTemplates = Collections.emptyList();
}

```

分析以上代码：

- 通过@Configuration 表明这是一个配置类
- 通过@ConditionalOnClass(RestTemplate.class)可以知道 RestTemplate 类要在类路径上存在才会实例化 LoadBalancerAutoConfiguration
- 通过@ConditionalOnBean(LoadBalancerClient.class)可以知道 LoadBalancerClient 类要存在才会实例化 LoadBalancerAutoConfiguration
- @EnableConfigurationProperties(LoadBalancerRetryProperties.class)是用来使用@ConfigurationProperties 注解的类 LoadBalancerRetryProperties 生效，贴上部分 LoadBalancerRetryProperties 类的代码，会更清晰：

```text
@ConfigurationProperties("spring.cloud.loadbalancer.retry")
public class LoadBalancerRetryProperties {

	private boolean enabled = true;

	/**
	 * Returns true if the load balancer should retry failed requests.
	 * @return True if the load balancer should retry failed requests; false otherwise.
	 */
	public boolean isEnabled() {
		return this.enabled;
	}

```

1. 所以重启下 RIBBON-CLIENT 服务，Debug 继续看 LoadBalancerAutoConfiguration 类的代码，发现在启动时会先进入 LoadBalancerAutoConfiguration 的 loadBalancerRequestFactory 方法，实例化出 LoadBalancerRequestFactory

```text
    @Bean
	@ConditionalOnMissingBean
	public LoadBalancerRequestFactory loadBalancerRequestFactory(
			LoadBalancerClient loadBalancerClient) {
		return new LoadBalancerRequestFactory(loadBalancerClient, this.transformers);
	}

```

接下去断点进入 LoadBalancerAutoConfiguration 类中的静态内部类 LoadBalancerInterceptorConfig 的 ribbonInterceptor 方法，可以看出这是为了实例化出 LoadBalancerInterceptor 拦截器

```text
    @Configuration
	@ConditionalOnMissingClass("org.springframework.retry.support.RetryTemplate")
	static class LoadBalancerInterceptorConfig {

		@Bean
		public LoadBalancerInterceptor ribbonInterceptor(
				LoadBalancerClient loadBalancerClient,
				LoadBalancerRequestFactory requestFactory) {
			return new LoadBalancerInterceptor(loadBalancerClient, requestFactory);
		}

```

继续跟断点，进入了 loadBalancedRestTemplateInitializerDeprecated 方法，可以看出这个方法里主要的逻辑代码是 customizer.customize(restTemplate)

```text
    @Bean
	public SmartInitializingSingleton loadBalancedRestTemplateInitializerDeprecated(
			final ObjectProvider<List<RestTemplateCustomizer>> restTemplateCustomizers) {
		return () -> restTemplateCustomizers.ifAvailable(customizers -> {
			for (RestTemplate restTemplate : LoadBalancerAutoConfiguration.this.restTemplates) {
				for (RestTemplateCustomizer customizer : customizers) {
					customizer.customize(restTemplate);
				}
			}
		});
	}

```

继续 Debug,断点进入 LoadBalancerAutoConfiguration 类中的静态内部类 LoadBalancerInterceptorConfig：

```text
@Configuration
@ConditionalOnMissingClass("org.springframework.retry.support.RetryTemplate")
	static class LoadBalancerInterceptorConfig {
		@Bean
		@ConditionalOnMissingBean
		public RestTemplateCustomizer restTemplateCustomizer(
				final LoadBalancerInterceptor loadBalancerInterceptor) {
			return restTemplate -> {
				List<ClientHttpRequestInterceptor> list = new ArrayList<>(
						restTemplate.getInterceptors());
				list.add(loadBalancerInterceptor);
				restTemplate.setInterceptors(list);
			};
		}
	}

```

通过 list.add(loadBalancerInterceptor)和 restTemplate.setInterceptors(list)两段代码可以看出，这是要给 restTemplate 加上 loadBalancerInterceptor 拦截器。

那么接下来看看 loadBalancerInterceptor 拦截器里做了什么,通过页面发起一个 http 请求,断点进入到 LoadBalancerInterceptor 类的 intercept 方法，

```text
@Override
	public ClientHttpResponse intercept(final HttpRequest request, final byte[] body,
			final ClientHttpRequestExecution execution) throws IOException {
		final URI originalUri = request.getURI();
		String serviceName = originalUri.getHost();
		Assert.state(serviceName != null,
				"Request URI does not contain a valid hostname: " + originalUri);
		return this.loadBalancer.execute(serviceName,
				this.requestFactory.createRequest(request, body, execution));
	}

```

截图看下信息：

![20191107162815756.png](https://img-blog.csdnimg.cn/20191107162815756.png)

可以看到该方法取得了 request 里的 url 和 servicName，然后将这些参数交给 loadBalancer.execute 去执行方法。而 loadBalancer 是 LoadBalancerClient 类的实例。
看下 LoadBalancerClient 的类图，可以看到 LoadBalancerClient 继承了 ServiceInstanceChooser，LoadBalancerClient 的实现类是 RibbonLoadBalancerClient

![20191107163802485.png](https://img-blog.csdnimg.cn/20191107163802485.png)

逻辑继续，断点进入了 RibbonLoadBalancerClient 的 execute 方法

```text
public <T> T execute(String serviceId, LoadBalancerRequest<T> request, Object hint)
			throws IOException {
		ILoadBalancer loadBalancer = getLoadBalancer(serviceId);
		Server server = getServer(loadBalancer, hint);
		if (server == null) {
			throw new IllegalStateException("No instances available for " + serviceId);
		}
		RibbonServer ribbonServer = new RibbonServer(serviceId, server,
				isSecure(server, serviceId),
				serverIntrospector(serviceId).getMetadata(server));

		return execute(serviceId, ribbonServer, request);
	}

```

跟着断点一步一步看方法：

- ILoadBalancer loadBalancer = getLoadBalancer(serviceId);

经过这个方法，得到 loadBalancer，从截图里可以看到，loadBalancer 里有个 allServerList 集合，里面有两个对象，端口号分别是 8763 和 8762，这就是我们提供的服务节点。

    ![20191107172116799.png](https://img-blog.csdnimg.cn/20191107172116799.png)

- Server server = getServer(loadBalancer, hint)

从图里可以看出，通过这个 getServer 方法，会返回给我们一个当前可调用的服务节点，而至于怎么返回服务节点，会再写一篇分析，写完后会更新链接到该篇。

    ![20191107172537248.png](https://img-blog.csdnimg.cn/20191107172537248.png)

- 生成 RibbonServer 作为参数传入 execute 方法
- 运行 execute 方法

接着跟进 execute 方法

![20191108111558612.png](https://img-blog.csdnimg.cn/20191108111558612.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl8zODEwNjMyMg==,size_16,color_FFFFFF,t_70)

可以看该方法里的关键执行方法是：
T returnVal = request.apply(serviceInstance);
接着看 apply 方法，发现它是 LoadBalancerRequest 接口的方法，该接口却没有具体的实现类：

```text
public interface LoadBalancerRequest<T> {

	T apply(ServiceInstance instance) throws Exception;

}

```

思路回溯，是 request 对象调用的 apply 方法，而 request 其实是 execute 方法传进来的参数，追溯到源头，发现是 LoadBalancerInterceptor 类的 intercept 方法里 this.requestFactory.createRequest(request, body, execution)生成了 LoadBalancerRequest，然后作为参数传入，之后再调用了 apply 方法

```text
@Override
	public ClientHttpResponse intercept(final HttpRequest request, final byte[] body,
			final ClientHttpRequestExecution execution) throws IOException {
		final URI originalUri = request.getURI();
		String serviceName = originalUri.getHost();
		Assert.state(serviceName != null,
				"Request URI does not contain a valid hostname: " + originalUri);
		return this.loadBalancer.execute(serviceName,
				this.requestFactory.createRequest(request, body, execution));
	}

```

跟进 createRequest 方法里：

![20191108143112594.png](https://img-blog.csdnimg.cn/20191108143112594.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl8zODEwNjMyMg==,size_16,color_FFFFFF,t_70)

可以从图中看到，经过一些操作后，生成的 serviceRequest 对象里的 serviceId 是 eureka-client，也就是我们的服务节点名，而 server 是 localhost:8763，这是具体的服务节点 ip，之后作为参数调用 org.springframework.http.client 包下的 InterceptingClientHttpRequest 类中的 execute 方法断点进入该方法：

![20191108145133749.png](https://img-blog.csdnimg.cn/20191108145133749.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl8zODEwNjMyMg==,size_16,color_FFFFFF,t_70)

可以看出通过 requestFactory.createRequest(request.getURI(), method)方法生成了 ClientHttpRequest 类的实例 delegate，它的 url 就是我们最后真正要请求的，最后正常调用 delegate.execute()方法取得返回 ClientHttpResponse 就好了。

而这里产生了一个疑问，url 是怎么产生的？重新发起请求断点试下
发现关键在 LoadBalancerRequestFactory 类中的 createRequest 方法中的这句：

```text
HttpRequest serviceRequest = new ServiceRequestWrapper(request, instance,his.loadBalancer);

```

跟进 ServiceRequestWrapper 类中，发现它继承了 HttpRequestWrapper 类，同时重写了 getURI 方法

```text
public class ServiceRequestWrapper extends HttpRequestWrapper {

	private final ServiceInstance instance;

	private final LoadBalancerClient loadBalancer;

	public ServiceRequestWrapper(HttpRequest request, ServiceInstance instance,
			LoadBalancerClient loadBalancer) {
		super(request);
		this.instance = instance;
		this.loadBalancer = loadBalancer;
	}

	@Override
	public URI getURI() {
		URI uri = this.loadBalancer.reconstructURI(this.instance, getRequest().getURI());
		return uri;
	}

}

```

断点打在 getURI 方法里：

![201911081504477.png](https://img-blog.csdnimg.cn/201911081504477.png)

可以看到该方法返回了我们最后需要的 url。

最后，关于 Ribbon 是如何通过一个@LoadBalanced 注解就实现负载均衡的分析就到这了，还是有很多疏漏的地方，但是大致的逻辑就是这样的了，还有一些更深层的比如如何根据策略选出当前提供服务的节点等，留待后续补充，来日方长~
