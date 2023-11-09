---
password: ''
icon: ''
date: '2023-05-23'
type: Post
category: 技术分享
urlname: hutool-beanutil-error
catalog:
  - archives
tags:
  - BUG
  - Java
  - hutool
summary: >-
  Hutool是一个小而全的Java工具类库，通过静态方法封装，降低相关API的学习成本，提高工作效率，使Java拥有函数式语言般的优雅，让Java语言也可以“甜甜的”。
  JavaBean是一个拥有对属性进行set和get方法的类。它可以被简单地定义为包含setXXX和getXXX方法的对象。在Hutool中，判定Bean的方法为：是否存在只有一个参数的setXXX方法。Bean工具类主要操作setXXX和getXXX方法，如将Bean对象转为Map等。
sort: ''
title: Hutool 5.8.8  BeanUtil.copyProperties 致命异常
status: Published
cover: 'https://plus.hutool.cn/images/logo.jpg'
updated: '2023-10-08 14:42:00'
abbrlink: 33194
---

## 前言

最近项目上要求升级一个工具包`hutool`的版本，以解决安全漏洞问题，这不升级还好，一升级反而捅出了更大的篓子，究竟是怎么回事呢？

## 事件回顾

我们项目原先使用的`hutool`版本是 5.7.2，在代码中，我们的数据传输对象 DTO 和数据实体对象中大量使用了工具包中的`BeanUtil.copyProperties()`, 大体代码如下：

1. 数据传输对象

```java
@Data
@ToString
public class DiagramDTO { 
   // 前端生产的字符串id  
   private String id;  
   private String code;
   private String name;
}
```

1. 数据实体对象

```java
@Data
@ToString
public class Diagram {  
  private Integer id;   
  private String code; 
  private String name;
}
```

1. 业务逻辑

```java
public class BeanCopyTest {   
	 public static void main(String[] args) { 
       // 前端传输的对象       
			 DiagramDTO diagramDTO = new DiagramDTO();  
      // 如果前端传入的id事包含e的，升级后就会报错     
		   diagramDTO.setId("3em3dgqsgmn0");     
		   diagramDTO.setCode("d1");       
			 diagramDTO.setName("图表");   
	     Diagram diagram = new Diagram();  
      // 关键点，数据拷贝        
			BeanUtil.copyProperties(diagramDTO, diagram);   
      System.out.println("数据实体对象：" + diagram);     
	   //设置id为空，自增        
			diagram.setId(null); 
      //保存到数据库中 TODO    
	    //diagramMapper.save(diagram); 
   }}
```

升级前，`hutool`是 5.7.2 版本下，执行结果如下图。

![image](https://mmbiz.qpic.cn/mmbiz_png/oH5VKTC5sLgticcibSXbXUSYLrUMNovDaTjjibKRMn2hre1iczL2YJiaKBfP6nMRibht3Aj5rABic23bXfGCiaAW0E9slQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

- `BeanUtil.copyProperties`虽然字段类型不一样，但是做了兼容处理，所以业务没有影响业务逻辑。

升级后，`hutool`是 5.8.8 版本，执行结果如下图所示：

![image](https://mmbiz.qpic.cn/mmbiz_png/oH5VKTC5sLgticcibSXbXUSYLrUMNovDaTU3PxCE8ZdB1RbGTZeOico3N8u9KV7okT3zWGN5kV5les3lYcX5SAXjg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

- 执行报错，因为升级后的版本修改了实现，增加了下面的逻辑，如果包含 E, 就会抛错，从而影响了业务逻辑，同时这个 id 是否包含 e 又是随机因素，到了生产才发现，就悲剧了。

![image](https://mmbiz.qpic.cn/mmbiz_png/oH5VKTC5sLgticcibSXbXUSYLrUMNovDaTG9TzjlbbByPMyMa7cAztWZJ3hBTRiatE1I4pLotd84fNgwkRIibyKAVw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

## 分析探讨

我发现大部分人写代码都喜欢偷懒，在上面的场景中，虽然`BeanUtil.copyProperties`用的一时爽，但有时候带来的后果是很严重的，所以很不推荐这种方式。为什么这么说呢？

比如团队中的某些人偷偷改了数据传输对象 DTO，比如修改了类型、删去了某个字段。用`BeanUtil.copyProperties`的方式压根无法在编译阶段发现，更别提修改的影响范围了，这就只能把风险暴露到生产上去了。那有什么更好的方法呢？

## 推荐方案

1. 原始的`get`、`set`方式

我是比较推崇这种做法的，比如现在`DiagramDTO`删去某个字段，编译器就会报错，就会引起你的注意了，让问题提前暴露，无处遁形。

![image](https://mmbiz.qpic.cn/mmbiz_png/oH5VKTC5sLgticcibSXbXUSYLrUMNovDaTliaL28982IYstMia7EjVia0KhJvWAwSkD4bjUwWFBnsAXGGvtbQfoOK0Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

你可能觉得站着说话不腰疼，字段少好，如果字段很多还不得写死啊，我这里推荐一个 IDEA 的插件，可以帮你智能生成这样的代码。

![image](https://mmbiz.qpic.cn/mmbiz_png/oH5VKTC5sLgticcibSXbXUSYLrUMNovDaT3mFLBMO8icetJcjicn4RqCwMuaeqibKoTNxTaJRuZOicXn4OdnYP9TPibsw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

![image](https://mmbiz.qpic.cn/mmbiz_png/oH5VKTC5sLgticcibSXbXUSYLrUMNovDaTSGKwbEQxgZgfbZQumibSH0yavicrPa9TJB2vxz6UCXN4hHBGv0j5flFA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

话不多说，自己玩儿去~~

1. 使用开源库`ModelMapper`

`ModelMapper`是一个开源库，可以很方便、简单地将对象从一种类型映射到另一种类型，底层是通过反射来自动确定对象之间的映射，还可以自定义映射规则。

```java
 private static void testModelMapper() {  
      ModelMapper modelMapper = new ModelMapper(); 
      DiagramDTO diagramDTO = new DiagramDTO(); 
       diagramDTO.setId("3em3dgqsgmn0");    
	     diagramDTO.setCode("d1");    
	     diagramDTO.setName("图表");   
     Diagram diagram = modelMapper.map(diagramDTO, Diagram.class);   
 }
```

1. 使用开源库`MapStruct`

`MapStruct`也是 Java 中另外一个用于映射对象很流行的开源工具。它是在编译阶段生成对应的映射代码，相对于`ModelMapper`底层放射的方案，性能更好。

```java
@Mapperpublic 
interface DiagramMapper {  
  DiagramMapper INSTANCE = Mappers.getMapper(DiagramMapper.class);   
 DiagramDTO toDTO(Diagram diagram); 
 Diagram toEntity(DiagramDTO diagram);
}

private static void testMapStruct() {  
  DiagramDTO diagramDTO = new DiagramDTO();
    diagramDTO.setId("3em3dgqsgmn0");  
    diagramDTO.setCode("d1");   
    diagramDTO.setName("图表"); 
  Diagram diagram = DiagramMapper.INSTANCE.toEntity(diagramDTO);
}
```

- `DiagramMapper`接口使用了`@Mapper`注解，用来表明使用`MapStruct`处理
- `MapStruct`中更多高级特性大家自己探索一下。

## 总结

小结一下，对象在不同层之间进行转换映射，很不建议使用`BeanUtil.copyProperties`这种方式，更加推荐使用原生的`set`, `get`方式，不容易出错。当然这不是将`BeanUtil.copyProperties`一棒子打死，毫无用武之地，在特定场景，比如方法内部对象的转换等影响小的范围还是很方便的。

原作者： [https://blog.csdn.net/weiioy](https://blog.csdn.net/weiioy)
