---
password: ''
icon: ''
date: '2020-01-22'
type: Post
category: 技术分享
urlname: '45'
catalog:
  - archives
tags:
  - Java
summary: >-
  String对象常量池String 对象的两种创建方式：String str1 =
  "abcd";//先检查字符串常量池中有没有"abcd"，如果字符串常量池中
sort: ''
title: Java基础-String
status: Published
cover: >-
  https://www.notion.so/images/page-cover/nasa_fingerprints_of_water_on_the_sand.jpg
updated: '2023-10-08 14:42:00'
abbrlink: 23829
---

## String 对象

### 常量池

**String 对象的两种创建方式：**

```java
String str1 = "abcd";//先检查字符串常量池中有没有"abcd"，如果字符串常量池中没有，则创建一个，然后 str1 指向字符串常量池中的对象，如果有，则直接将 str1 指向"abcd""；
String str2 = new String("abcd");//堆中创建一个新的对象
String str3 = new String("abcd");//堆中创建一个新的对象
System.out.println(str1==str2);//false
System.out.println(str2==str3);//falseCopy to clipboardErrorCopied

```

这两种不同的创建方法是有差别的。

- 第一种方式是在常量池中拿对象；
- 第二种方式是直接在堆内存空间创建一个新的对象。

记住一点：**只要使用 new 方法，便需要创建新的对象。**

再给大家一个图应该更容易理解，图片来源：[https://www.journaldev.com/797/what-is-java-string-pool：](https://www.journaldev.com/797/what-is-java-string-pool%EF%BC%9A)

![202203222203380.png](https://blog-file.hehouhui.cn/202203222203380.png)

**String 类型的常量池比较特殊。它的主要使用方法有两种：**

- 直接使用双引号声明出来的 String 对象会直接存储在常量池中。
- 如果不是用双引号声明的 String 对象，可以使用 String 提供的 intern 方法。String.intern() 是一个 Native 方法，它的作用是：如果运行时常量池中已经包含一个等于此 String 对象内容的字符串，则返回常量池中该字符串的引用；如果没有，JDK1.7 之前（不包含 1.7）的处理方式是在常量池中创建与此 String 内容相同的字符串，并返回常量池中创建的字符串的引用，JDK1.7 以及之后的处理方式是在常量池中记录此字符串的引用，并返回该引用。

```java
          String s1 = new String("计算机");
          String s2 = s1.intern();
          String s3 = "计算机";
          System.out.println(s2);//计算机
          System.out.println(s1 == s2);//false，因为一个是堆内存中的 String 对象一个是常量池中的 String 对象，
          System.out.println(s3 == s2);//true，因为两个都是常量池中的 String 对象Copy to clipboardErrorCopied

```

**字符串拼接:**

```java
          String str1 = "str";
          String str2 = "ing";

          String str3 = "str" + "ing";//常量池中的对象
          String str4 = str1 + str2; //在堆上创建的新的对象
          String str5 = "string";//常量池中的对象
          System.out.println(str3 == str4);//false
          System.out.println(str3 == str5);//true
          System.out.println(str4 == str5);//falseCopy to clipboardErrorCopied

```

![202203222203646.png](https://blog-file.hehouhui.cn/202203222203646.png)

尽量避免多个字符串拼接，因为这样会重新创建对象。如果需要改变字符串的话，可以使用 StringBuilder 或者 StringBuffer。

### new String("test"); 创建几个对象?

**. 将创建 1 或 2 个字符串。如果池中已存在字符串常量“abc”，则只会在堆空间创建一个字符串常量“abc”。如果池中没有字符串常量“abc”，那么它将首先在池中创建，然后在堆空间中创建，因此将创建总共 2 个字符串对象。**

**验证：**

```java
        String s1 = new String("abc");// 堆内存的地址值
        String s2 = "abc";
        System.out.println(s1 == s2);// 输出 false,因为一个是堆内存，一个是常量池的内存，故两者是不同的。
        System.out.println(s1.equals(s2));// 输出 trueCopy to clipboardErrorCopied

```

**结果：**

```text
false
true

```
