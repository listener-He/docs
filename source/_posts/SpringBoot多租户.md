---
abbrlink: spring-tenant-2023
categories:
- - spring
date: '2023-09-23T21:56:23.572235+08:00'
excerpt: 1 什么是多租户架构？ 多租户架构是指在一个应用中支持多个租户（Tenant）同时访问，每个租户拥有独立的资源和数据，并且彼此之间完全隔离。通俗来说，多租户就是把一个应用按照客户的需求“分割”成多个独立的实例，每个实例互不干扰。 2 多租户架构的优势  更好地满足不同租户的个性化需求。 可以降低运维成本，减少硬件、网络等基础设施的投入。 节约开发成本，通过复用代码，快速上线新的租户实例。 增强了系...
tags:
- spring
- saas
title: Spring Boot 实现多租户架构：支持应用多租户部署和管理
updated: 2023-9-23T22:2:46.815+8:0
---
### 1 什么是多租户架构？

多租户架构是指在一个应用中支持多个租户（Tenant）同时访问，每个租户拥有独立的资源和数据，并且彼此之间完全隔离。通俗来说，多租户就是把一个应用按照客户的需求“分割”成多个独立的实例，每个实例互不干扰。

### 2 多租户架构的优势

* 更好地满足不同租户的个性化需求。
* 可以降低运维成本，减少硬件、网络等基础设施的投入。
* 节约开发成本，通过复用代码，快速上线新的租户实例。
* 增强了系统的可扩展性和可伸缩性，支持水平扩展，每个租户的数据和资源均可管理和控制。

### 3 实现多租户架构的技术选择

对于实现多租户架构技术不是最重要的最重要的是正确的架构思路。但是选择正确的技术可以更快地实现多租户架构。

### 1 架构选型

基于Java开发多租户应用推荐使用Spring Boot和Spring Cloud。Spring Boot能快速搭建应用并提供许多成熟的插件。Spring Cloud则提供了许多实现微服务架构的工具和组件。

### 1.1 Spring Boot

使用Spring Boot可以简化项目的搭建过程自动配置许多常见的第三方库和组件，减少了开发人员的工作量。

```java
@RestController
public class TenantController {

		@GetMapping("/hello")
		public String hello(@RequestHeader("tenant-id") String tenantId) {
			return "Hello, " + tenantId;
		}
}
```

### 1.2 Spring Cloud

在架构多租户的系统时Spring Cloud会更加有用。Spring Cloud提供了一些成熟的解决方案，如Eureka、Zookeeper、Consul等，以实现服务发现、负载均衡等微服务功能。

### 2 数据库设计

在多租户环境中数据库必须为每个租户分别存储数据并确保数据隔离。我们通常使用以下两种方式实现：

* 多个租户共享相同的数据库，每个表中都包含tenant\_id这一列，用于区分不同租户的数据。
* 为每个租户创建单独的数据库，每个数据库内的表结构相同，但数据相互隔离。

### 3 应用多租户部署

为了实现多租户在应用部署时我们需要考虑以下两个问题。

### 3.1 应用隔离

在多租户环境中不同租户需要访问不同的资源，因此需要进行应用隔离。可以通过构建独立的容器或虚拟机、使用命名空间等方式实现。Docker就是一种非常流行的隔离容器技术。

### 3.2 应用配置

由于每个租户都有自己的配置需求因此需要为每个租户分别设置应用配置信息，例如端口号、SSL证书等等。这些配置可以存储在数据库中，也可以存储在云配置中心中。

### 4 租户管理

在多租户系统中需要能够管理不同租户的数据和资源，同时需要为每个租户分配相应的权限。解决方案通常包括以下两部分。

### 4.1 租户信息维护

租户信息的维护包括添加、修改、删除、查询等操作，要求能够根据租户名称或租户ID快速查找对应的租户信息。

```sql
CREATE TABLE tenant (    
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 4.2 租户权限控制

在多租户应用中必须为每个租户分别设置对系统资源的访问权限。例如，A租户和B租户不能访问彼此的数据。

```java
@EnableGlobalMethodSecurity(prePostEnabled = true)
@Configuration 
public class SecurityConfig extends WebSecurityConfigurerAdapter {
	@Override
	protected void configure(HttpSecurity http) throws Exception {
	    http.authorizeRequests()
	        .antMatchers("/api/tenant/**").hasRole("ADMIN")
	        .anyRequest().authenticated()
	        .and()
	        .formLogin();
	}
	@Autowired
	public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
	    auth.userDetailsService(userDetailsService())
	        .passwordEncoder(new BCryptPasswordEncoder())
	        .and()
	        .inMemoryAuthentication()
	        .withUser("admin")
	        .password(new BCryptPasswordEncoder().encode("123456"))
	        .roles("ADMIN");
	}
}
```

### 1 Spring Boot中的多租户实现

在Spring Boot中可以通过多数据源和动态路由来实现多租户机制。

### 1.1 多数据源实现

多数据源是指为不同的租户配置不同的数据源，使得每个租户都可以访问自己的独立数据。具体实现方法如下：

```java
@Configuration 
public class DataSourceConfig {
		@Bean(name = "dataSourceA")
		@ConfigurationProperties(prefix = "spring.datasource.a")
		public DataSource dataSourceA() {
		    return DataSourceBuilder.create().build();
		}
	
		@Bean(name = "dataSourceB")
		@ConfigurationProperties(prefix = "spring.datasource.b")
		public DataSource dataSourceB() {
		    return DataSourceBuilder.create().build();
		}
	
		@Bean(name = "dataSourceC")
		@ConfigurationProperties(prefix = "spring.datasource.c")
		public DataSource dataSourceC() {
		    return DataSourceBuilder.create().build();
		}
}
```

以上代码是配置了三个数据源分别对应三个租户。然后在使用时，可以使用注解标记需要连接的数据源。

```java
@Service
public class ProductService {
	@Autowired
	@Qualifier(“dataSourceA”)
	private DataSource dataSource;
	// …
}
```

### 1.2 动态路由实现

动态路由是指根据请求的URL或参数动态地切换到对应租户的数据源。具体实现如下：

```java
public class DynamicDataSource extends AbstractRoutingDataSource {
	@Override
	protected Object determineCurrentLookupKey() {
	return TenantContextHolder.getTenantId();
	}
}

@Configuration
public class DataSourceConfig {

	@Bean(name = "dataSource")
	@ConfigurationProperties(prefix = "spring.datasource")
	public DataSource dataSource() {
		return DataSourceBuilder.create().type(DynamicDataSource.class).build();
	}
}
```

以上是动态路由的核心代码`DynamicDataSource`继承自`AbstractRoutingDataSource`，通过`determineCurrentLookupKey()`方法动态获得租户ID，然后切换到对应的数据源。

### 2 Spring Cloud中的多租户实现

在Spring Cloud中可以通过服务注册与发现、配置中心、负载均衡等方式实现多租户机制。

```java
/**
 * 多租户配置类
 */
@Configuration
public class TenantConfig {

    /**
     * 注册多租户拦截器
     */
    @Bean
    public TenantInterceptor tenantInterceptor() {
        return new TenantInterceptor();
    }

    /**
     * 注册多租户数据源
     */
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource")
    public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }

    /**
     * 配置多租户Mybatis插件
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new TenantLineInnerInterceptor(new TenantHandler()));
        return interceptor;
    }

    /**
     * 配置多租户Mybatis拦截器
     */
    @Bean
    public MybatisInterceptor mybatisInterceptor() {
        MybatisInterceptor interceptor = new MybatisInterceptor();
        interceptor.addInnerInterceptor(new TenantLineInnerInterceptor(new TenantHandler()));
        return interceptor;
    }

    /**
     * 配置多租户Feign拦截器
     */
    @Bean
    public RequestInterceptor feignInterceptor() {
        return new TenantFeignInterceptor();
    }

    /**
     * 配置多租户Ribbon拦截器
     */
    @Bean
    public LoadBalancerInterceptor ribbonInterceptor() {
        return new TenantLoadBalancerInterceptor();
    }

    /**
     * 注册多租户Redis配置
     */
    @Bean
    public TenantRedisConfig tenantRedisConfig() {
        return new TenantRedisConfig();
    }

}
```

### 2.1 服务注册与发现

使用Spring Cloud中的Eureka实现服务注册与发现。每个租户的服务都在注册中心以不同的应用名称进行注册，客户端可以通过服务名称来访问对应租户的服务。

### 2.2 配置中心

使用Spring Cloud Config作为配置中心。配置文件以租户ID进行区分，客户端通过读取对应租户的配置文件来获取配置信息。

### 2.3 负载均衡

使用Spring Cloud Ribbon作为负载均衡器。根据请求的URL或参数选择对应租户的服务实例进行请求转发。

### 2.4 API

在API网关层面实现多租户机制根据请求的URL或参数判断所属租户，并转发到对应租户的服务实例。

### 1 私有云环境

私有云环境指的是由企业自行搭建的云环境，不对外提供服务，主要应用于企业内部的数据存储、管理、共享和安全控制。相较于公有云，私有云的优点在于可以更好地保护企业核心数据，同时也能够满足企业对于数据安全性和可控性的要求。

### 2 公有云环境

公有云环境指的是由云服务商搭建并对外提供服务的云环境，用户可以根据需要购买相应的云服务，如云存储、云计算、云数据库等。相较于私有云，公有云的优点在于具有成本低廉、弹性伸缩、全球化部署等特点，能够更好地满足企业快速发展的需求。

### 3 企业级应用

企业级应用是指面向企业客户的应用程序，主要包括ERP、CRM、OA等一系列应用系统。这类应用的特点在于功能强大、流程复杂、数据量大，需要满足企业的高效率、高可靠性、高安全性和易维护性等要求。在云计算环境下，企业可以将这些应用部署在私有云或公有云上，减少了硬件设备的投入和维护成本，提高了管理效率。

### 1 搭建Spring Boot和Spring Cloud环境

首先需要在Maven项目中引入以下依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>2020.0.3</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

然后需要在application.yml中配置相应的参数，如下所示：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/appdb?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
    username: root
    password: 123456
  mybatis:
    type-aliases-package: com.example.demo.model
    mapper-locations: classpath:mapper/*.xml
server:
  port: 8080
eureka:
  client:
    serviceUrl:
      defaultZone: <http://localhost:8761/eureka/>
  management:
    endpoints:
      web:
        exposure:
          include: "*"
```

其中`datasource.url`为数据库连接的URL，username和password为数据库连接的账号和密码；`server.port`为Spring Boot应用启动的端口；`eureka.client.serviceUrl.defaultZone`为Eureka服务注册中心的URL。

### 2 修改数据库设计

接下来需要对数据库进行相应的修改，以支持多租户部署。具体来说，我们需要在数据库中添加一个与租户相关的字段，以便在应用中区分不同的租户。

### 3 实现应用多租户部署

接着需要在代码中实现应用的多租户部署功能。具体来说，我们需要为每个租户实例化对应的Spring Bean，并根据租户ID将请求路由到相应的Bean中去处理。

以下是一个简单的实现示例：

```java
@Configuration
public class MultiTenantConfig {
    // 提供对应租户的数据源
    @Bean
    public DataSource dataSource(TenantRegistry tenantRegistry) {
        return new TenantAwareDataSource(tenantRegistry);
    }

    // 多租户Session工厂
    @Bean(name = "sqlSessionFactory")
    public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
        SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
        sessionFactory.setDataSource(dataSource);
        return sessionFactory.getObject();
    }

    // 动态切换租户
    @Bean
    public MultiTenantInterceptor multiTenantInterceptor(TenantResolver tenantResolver) {
        MultiTenantInterceptor interceptor = new MultiTenantInterceptor();
        interceptor.setTenantResolver(tenantResolver);
        return interceptor;
    }

    // 注册拦截器
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(multiTenantInterceptor());
    }

    // 注册租户信息
    @Bean
    public TenantRegistry tenantRegistry() {
        return new TenantRegistryImpl();
    }

    // 解析租户ID
    @Bean
    public TenantResolver tenantResolver() {
        return new HeaderTenantResolver();
    }
}
```

其中`MultiTenantConfig`是多租户部署的核心配置类，它提供了对应租户数据源、多租户Session工厂、动态切换租户等功能。

### 4 实现租户管理

最后需要实现一个租户管理的功能，以便在系统中管理不同的租户。具体来说，我们可以使用Spring Cloud的服务注册与发现组件Eureka来注册每个租户的实例，并在管理界面中进行相应的操作。另外，我们还需要为每个租户提供一个独立的数据库，以保证数据隔离性。

本文详细介绍了如何使用Spring Boot和Spring Cloud实现一个支持多租户部署的应用。主要包括搭建Spring Boot和Spring Cloud环境、修改数据库设计、实现应用多租户部署、实现租户管理等方面。

应用场景主要包括SaaS应用、多租户云服务等。优劣势主要体现在提升了应用的可扩展性和可维护性，但也增加了部署和管理的复杂度。未来的改进方向可以考虑进一步提升多租户管理的自动化程度，减少人工干预和错误率。

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
// 创建租户服务
// 添加Eureka依赖
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
// 创建租户管理模块
// 添加Spring Data JPA依赖
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```


```java

// 在Spring Boot和Spring Cloud环境下搭建多租户应用
// 修改数据库设计，实现应用多租户部署，实现租户管理
// 使用Eureka服务注册与发现组件注册每个租户的实例



// 启用Eureka
@EnableEurekaServer
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}


// 注册租户服务
@EnableDiscoveryClient
@SpringBootApplication
public class TenantServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(TenantServiceApplication.class, args);
    }
}

// 配置文件
spring:
  application:
    name: tenant-service
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/



// 创建Tenant实体类
@Entity
@Table(name = "tenant")
public class Tenant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String databaseName;
    private String databaseUsername;
    private String databasePassword;
    // getter和setter
}

// 创建TenantRepository接口
public interface TenantRepository extends JpaRepository<Tenant, Long> {
}

// 创建TenantService类
@Service
public class TenantService {
    @Autowired
    private TenantRepository tenantRepository;
    // 添加租户
    public Tenant addTenant(Tenant tenant) {
        return tenantRepository.save(tenant);
    }
    // 获取所有租户
    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }
    // 根据id获取租户
    public Tenant getTenantById(Long id) {
        return tenantRepository.findById(id).orElse(null);
    }
    // 根据id删除租户
    public void deleteTenantById(Long id) {
        tenantRepository.deleteById(id);
    }
}

// 创建TenantController类
@RestController
@RequestMapping("/tenants")
public class TenantController {
    @Autowired
    private TenantService tenantService;
    // 添加租户
    @PostMapping("")
    public Tenant addTenant(@RequestBody Tenant tenant) {
        return tenantService.addTenant(tenant);
    }
    // 获取所有租户
    @GetMapping("")
    public List<Tenant> getAllTenants() {
        return tenantService.getAllTenants();
    }
    // 根据id获取租户
    @GetMapping("/{id}")
    public Tenant getTenantById(@PathVariable Long id) {
        return tenantService.getTenantById(id);
    }
    // 根据id删除租户
    @DeleteMapping("/{id}")
    public void deleteTenantById(@PathVariable Long id) {
        tenantService.deleteTenantById(id);
    }
}

// 创建多租户数据库
public class MultiTenantConnectionProviderImpl implements MultiTenantConnectionProvider {
    private Map<String, DataSource> dataSourceMap = new HashMap<>();
    @Override
    public Connection getAnyConnection() throws SQLException {
        return dataSourceMap.values().iterator().next().getConnection();
    }
    @Override
    public Connection getConnection(String tenantIdentifier) throws SQLException {
        DataSource dataSource = dataSourceMap.get(tenantIdentifier);
        if (dataSource == null) {
            throw new SQLException("No dataSource found for tenantIdentifier: " + tenantIdentifier);
        }
        return dataSource.getConnection();
    }
    @Override
    public void releaseAnyConnection(Connection connection) throws SQLException {
        connection.close();
    }
    @Override
    public void releaseConnection(String tenantIdentifier, Connection connection) throws SQLException {
        connection.close();
    }
    @Override
    public boolean supportsAggressiveRelease() {
        return true;
    }
}

// 创建多租户实体类
@Entity
@Table(name = "customer", schema = "tenant1")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;
    // getter和setter
}

// 创建多租户Repository接口
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByTenantId(Long tenantId);
}

// 创建多租户Service类
@Service
public class CustomerService {
    @Autowired
    private CustomerRepository customerRepository;
    // 添加客户
    public Customer addCustomer(Customer customer) {
        return customerRepository.save(customer);
    }
    // 获取所有客户
    public List<Customer> getAllCustomers(Long tenantId) {
        return customerRepository.findByTenantId(tenantId);
    }
    // 根据id获取客户
    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id).orElse(null);
    }
    // 根据id删除客户
    public void deleteCustomerById(Long id) {
        customerRepository.deleteById(id);
    }
}

// 创建多租户Controller类
@RestController
@RequestMapping("/{tenantId}/customers")
public class CustomerController {
    @Autowired
    private CustomerService customerService;
    // 添加客户
    @PostMapping("")
    public Customer addCustomer(@RequestBody Customer customer) {
        return customerService.addCustomer(customer);
    }
    // 获取所有客户
    @GetMapping("")
    public List<Customer> getAllCustomers(@PathVariable Long tenantId) {
        return customerService.getAllCustomers(tenantId);
    }
    // 根据id获取客户
    @GetMapping("/{id}")
    public Customer getCustomerById(@PathVariable Long id) {
        return customerService.getCustomerById(id);
    }
    // 根据id删除客户
    @DeleteMapping("/{id}")
    public void deleteCustomerById(@PathVariable Long id) {
        customerService.deleteCustomerById(id);
    }
}
```
