---
password: ''
icon: ''
date: '2020-06-02'
type: Post
category: 技术分享
urlname: '18'
catalog:
  - archives
tags:
  - Spring
  - 缓存
summary: >-
  Spring
  Cache是Spring框架用于支持缓存的模块。它提供了一组缓存抽象，使得我们可以将不同的缓存技术集成到应用程序中，从而提高性能和可扩展性。Spring
  Cache通过使用轻量级的注释来定义缓存的行为，从而减少了缓存操作的复杂性。此外，Spring
  Cache还支持事务性缓存，这样可以保证缓存与数据库之间的一致性。总体来说，Spring Cache是一个强大的工具，可以极大地提高应用程序的性能和可用性。
sort: ''
title: spring cache
status: Published
updated: '2023-10-08 14:42:00'
abbrlink: 2780
---

> 💡 Spring Cache 是一个强大的缓存框架，可用于提高应用程序的性能和可靠性。它是 Spring 框架的一部分，基于标准的缓存抽象，提供了一个统一的、可扩展的缓存解决方案。Spring Cache 支持多种缓存提供者，包括 Ehcache、Redis、Couchbase 等。它还提供了灵活的配置选项，使开发人员可以根据应用程序的需要选择最适合的缓存解决方案。
>
> 使用 Spring Cache 可以帮助应用程序减少对数据库和其他外部资源的访问次数，从而提高应用程序的响应速度和吞吐量。除了提高性能之外，Spring Cache 还可以用于添加应用程序级别的缓存逻辑，例如缓存用户会话、结果集等。
>
> 总之，Spring Cache 是一个十分强大的工具，可用于提高应用程序的性能和可靠性。它在 Spring 框架中的定位十分重要，是一个不可或缺的组件。如果您想要在应用程序中使用缓存，那么 Spring Cache 绝对是一个值得考虑的选择。

### **@Cacheable**

@Cacheable 的作用 主要针对方法配置，**能够根据方法的请求参数对其结果进行缓存**

@Cacheable 作用和配置方法

| 参数      | 解释                                                                                                  | example                                                                |
| --------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| value     | 缓存的名称，在 [spring](http://www.aspku.com/kaifa/java/237386.html) 配置文件中定义，必须指定至少一个 | 例如: @Cacheable(value=”mycache”) @Cacheable(value={”cache1”,”cache2”} |
| key       | 缓存的 key，可以为空，如果指定要按照 SpEL 表达式编写，如果不指定，则缺省按照方法的所有参数进行组合    | @Cacheable(value=”testcache”,key=”#userName”)                          |
| condition | 缓存的条件，可以为空，使用 SpEL 编写，返回 true 或者 false，只有为 true 才进行缓存                    | @Cacheable(value=”testcache”,condition=”#userName.length()>2”)         |

---

**实例**

> @Cacheable(value=”accountCache”)，这个注释的意思是：

当调用这个方法的时候，**会先从一个名叫 accountCache 的缓存中查询**，如果没有，则执行实际的方法（即查询数据库），并将执行的结果存入缓存中，否则返回缓存中的对象。**这里的缓存中的 key 就是参数 userName，value 就是 Account 对象。**

**“accountCache”缓存是在 \*\***spring\*.xml\*\* **中定义的名称。**

```java
@Cacheable(value="accountCache")// 使用了一个缓存名叫 accountCache
public Account getAccountByName(String userName) {
   // 方法内部实现不考虑缓存逻辑，直接实现业务
   System.out.println("real query account."+userName);
   return getFromDB(userName);

}

```

**而在 SpringBoot 中使用的话是存放在 resources 下的\*\***ehcache.xml\***\*。**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ehcache xmlns:xsi="<http://www.w3.org/2001/XMLSchema-instance>"
         xsi:noNamespaceSchemaLocation="<http://ehcache.org/ehcache.xsd>"

         updateCheck="false">

    <!--账号缓存-->

    <cache name="accountCache" maxElementsInMemory="10000" timeToLiveSeconds="300"  timeToIdleSeconds="310"   eternal="false" overflowToDisk="true"/>

</ehcache>

```

---

### **@CachePut**

> @CachePut 作用和配置方法：

@CachePut 的作用 主要针对方法配置，能够根据方法的请求参数对其结果进行缓存，和 @Cacheable 不同的是，**它每次都会触发真实方法的调用**

| 参数      | 解释                                                                                               | example                                                       |
| --------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| value     | 缓存的名称，在 spring 配置文件中定义，必须指定至少一个                                             | @CachePut(value=”my cache”)                                   |
| key       | 缓存的 key，可以为空，如果指定要按照 SpEL 表达式编写，如果不指定，则缺省按照方法的所有参数进行组合 | @CachePut(value=”testcache”,key=”#userName”)                  |
| condition | 缓存的条件，可以为空，使用 SpEL 编写，返回 true 或者 false，只有为 true 才进行缓存                 | @CachePut(value=”testcache”,condition=”#userName.length()>2”) |

**实例**

**@CachePut 注释，这个注释可以确保方法被执行，同时方法的返回值也被记录到缓存中，实现缓存与数据库的同步更新。**

```java
@CachePut(value="accountCache",key="#account.getName()")// 更新accountCache 缓存
public Account updateAccount(Account account) {
  return updateDB(account);
}

```

---

### **@CacheEvict**

> @CacheEvict 作用和配置方法

@CachEvict 的作用 主要针对方法配置，**能够根据一定的条件对缓存进行清空**

| 参数             | 解释                                                                                                                                        | example                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| value            | 缓存的名称，在 spring 配置文件中定义，必须指定至少一个                                                                                      | @CacheEvict(value=”my cache”)                                   |
| key              | 缓存的 key，可以为空，如果指定要按照 SpEL 表达式编写，如果不指定，则缺省按照方法的所有参数进行组合                                          | @CacheEvict(value=”testcache”,key=”#userName”)                  |
| condition        | 缓存的条件，可以为空，使用 SpEL 编写，返回 true 或者 false，只有为 true 才进行缓存                                                          | @CacheEvict(value=”testcache”,condition=”#userName.length()>2”) |
| allEntries       | 是否清空所有缓存内容，缺省为 false，如果指定为 true，则方法调用后将立即清空所有缓存                                                         | @CachEvict(value=”testcache”,allEntries=true)                   |
| beforeInvocation | 是否在方法执行前就清空，缺省为 false，如果指定为 true，则在方法还没有执行的时候就清空缓存，缺省情况下，如果方法执行抛出异常，则不会清空缓存 | @CachEvict(value=”testcache”，beforeInvocation=true)            |

实例

```java
@CacheEvict(value="accountCache",key="#account.getName()")// 清空accountCache 缓存
public void updateAccount(Account account) {
   updateDB(account);
}


@CacheEvict(value="accountCache",allEntries=true)// 清空accountCache 缓存
public void reload() {

   reloadAll()

}




@Cacheable(value="accountCache",condition="#userName.length() <=4")// 缓存名叫 accountCache
public Account getAccountByName(String userName) {

 // 方法内部实现不考虑缓存逻辑，直接实现业务
 return getFromDB(userName);

}

```

---

### **@CacheConfig**

所有的@Cacheable（）里面都有一个 value ＝“xxx”的属性，这显然如果方法多了，写起来也是挺累的，如果可以一次性声明完 那就省事了， 所以，有了@CacheConfig 这个配置，@CacheConfig is a class-level annotation that allows to share the cache names，如果你在你的方法写别的名字，那么依然以方法的名字为准。

```java
@CacheConfig("books")
public class BookRepositoryImpl implements BookRepository {


  @Cacheable
  public Book findBook(ISBN isbn) {...}

}
```

---

### **条件缓存**

下面提供一些常用的条件缓存

```java
//@Cacheable将在执行方法之前( #result还拿不到返回值)判断condition，如果返回true，则查缓存；
@Cacheable(value = "user", key = "#id", condition = "#id lt 10")
public User conditionFindById(final Long id)




//@CachePut将在执行完方法后（#result就能拿到返回值了）判断condition，如果返回true，则放入缓存；
@CachePut(value = "user", key = "#id", condition = "#result.username ne 'zhang'")
public User conditionSave(final User user)



//@CachePut将在执行完方法后（#result就能拿到返回值了）判断unless，如果返回false，则放入缓存；（即跟condition相反）
@CachePut(value = "user", key = "#user.id", unless = "#result.username eq 'zhang'")
public User conditionSave2(final User user)



//@CacheEvict， beforeInvocation=false表示在方法执行之后调用（#result能拿到返回值了）；且判断condition，如果返回true，则移除缓存；
@CacheEvict(value = "user", key = "#user.id", beforeInvocation = false, condition = "#result.username ne 'zhang'")
public User conditionDelete(final User user)

```

---

### **@Caching**

有时候我们可能组合多个 Cache 注解使用；比如用户新增成功后，我们要添加 id–>user；username—>user；email—>user 的缓存；此时就需要@Caching 组合多个注解标签了。

```java
@Caching(put = {
@CachePut(value = "user", key = "#user.id"),
@CachePut(value = "user", key = "#user.username"),
@CachePut(value = "user", key = "#user.email")
})

public User save(User user) {

```

---

### **自定义缓存注解**

比如之前的那个@Caching 组合，会让方法上的注解显得整个代码比较乱，此时可以使用自定义注解把这些注解组合到一个注解中，如：

```java
@Caching(put = {
@CachePut(value = "user", key = "#user.id"),
@CachePut(value = "user", key = "#user.username"),
 @CachePut(value = "user", key = "#user.email")
})

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
public @interface UserSaveCache {
}
```

这样我们在方法上使用如下代码即可，整个代码显得比较干净。

```java
@UserSaveCache
public User save(User user)

```

---

### 扩展

比如 findByUsername 时，不应该只放 username–>user，应该连同 id—>user 和 email—>user 一起放入；这样下次如果按照 id 查找直接从缓存中就命中了

```java
@Caching(
  cacheable = {
    @Cacheable(value = "user", key = "#username")
  },
  put = {
    @CachePut(value = "user", key = "#result.id", condition = "#result != null"),
    @CachePut(value = "user", key = "#result.email", condition = "#result != null")
  }
)
public User findByUsername(final String username) {
  System.out.println("cache miss, invoke find by username, username:" + username);
  for (User user : users) {
    if (user.getUsername().equals(username)) {
      return user;
    }
  }
  return null;
}

```

其实对于：id—>user；username—->user；email—>user；更好的方式可能是：id—>user；username—>id；email—>id；保证 user 只存一份；如：

```java
@CachePut(value="cacheName", key="#user.username", cacheValue="#user.username")
public void save(User user)


@Cacheable(value="cacheName", key="#user.username", cacheValue="#caches[0].get(#caches[0].get(#username).get())")

public User findByUsername(String username)

```

**SpEL 上下文数据**

Spring Cache 提供了一些供我们使用的 SpEL 上下文数据，下表直接摘自 Spring 官方文档：

| 名称          | 位置       | 描述                                                                                                 | 示例                                         |
| ------------- | ---------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| methodName    | root 对象  | 当前被调用的方法名                                                                                   | root.methodName                              |
| method        | root 对象  | 当前被调用的方法                                                                                     | [root.method.name](http://root.method.name/) |
| target        | root 对象  | 当前被调用的目标对象                                                                                 | root.target                                  |
| targetClass   | root 对象  | 当前被调用的目标对象类                                                                               | root.targetClass                             |
| args          | root 对象  | 当前被调用的方法的参数列表                                                                           | root.args[0]                                 |
| caches        | root 对象  | 当前方法调用使用的缓存列表（如@Cacheable(value={“cache1”, “cache2”})），则有两个 cache               | root.caches[0].name                          |
| argument name | 执行上下文 | 当前被调用的方法的参数，如 findById(Long id)，我们可以通过#id 拿到参数                               | [user.id](http://user.id/)                   |
| result        | 执行上下文 | 方法执行后的返回值（仅当方法执行之后的判断有效，如‘unless'，'cache evict'的 beforeInvocation=false） | result                                       |

```java
@CacheEvict(value = "user", key = "#user.id", condition = "#root.target.canCache() and #root.caches[0].get(#user.id).get().username ne #user.username", beforeInvocation = true)
public void conditionUpdate(User user)
```
