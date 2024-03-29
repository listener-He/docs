---
password: ''
icon: ''
date: '2022-02-21'
type: Post
category: 技术分享
urlname: '38'
catalog:
  - archives
tags:
  - mysql
summary: >-
  Mysql数据库存储引擎MyISAM引擎
  不支持事务支持表级锁（MySql支持两种表级锁，表共享读锁和表独占写锁），但不支持行级锁存储表的总行数一个MyISAM表有三个文件：索引文件（.MYI
sort: ''
title: Mysql数据结构&锁
status: Published
cover: 'https://cdn.jsdelivr.net/gh/listener-He/images@default/202305102214388.png'
updated: '2023-10-08 14:42:00'
abbrlink: 43672
---

# Mysql 数据库

## 存储引擎

### MyISAM 引擎

    不支持事务

支持表级锁（MySql 支持两种表级锁，表共享读锁和表独占写锁），但不支持行级锁

存储表的总行数

一个 MyISAM 表有三个文件：索引文件（.MYI），表结构文件(.frm)，数据文件(.MYD)

采用非聚集索引：即索引文件和数据文件是分开的，索引文件的数据域存储指向数据文件的指针

跨平台应用更方便（表保存为文件形式）

支持三种不同的存储格式：

（1）静态表：存储迅速，容易缓存，出现故障容易恢复；但是占用内存多，因为会按列宽度补足空格

（2）动态表：占用空间少，但是频繁更新和删除容易产生碎片，需要定期整理（OPTIMIZE TABLE），并且出现故障难以恢复。

（3）压缩表：占据的磁盘空间非常小（每个记录被单独压缩，所以访问开支很小）。

### InnoDb 引擎

支持事务

支持行级锁（仅在条件语句中包括主键索引时）

内存使用率低

查询效率和写的效率更低

采用聚集索引，索引和数据存在一起，叶子结点直接存的是数据。

支持外键

> 注：MyISAM 在查询时的性能比 InnoDB 高，因为它采用的辅索引和主键索引类似，所以通过辅索引查找数据时只需要通过辅索引树就可以查找到，而 InnoDB 需要先通过辅索引查找到主索引，再通过主索引树查找到数据。

### MyISAM 和 InnoDB 区别

MyISAM 是 MySQL 的默认数据库引擎（5.5 版之前）。虽然性能极佳，而且提供了大量的特性，包括全文索引、压缩、空间函数等，但 MyISAM 不支持事务和行级锁，而且最大的缺陷就是崩溃后无法安全恢复。不过，5.5 版本之后，MySQL 引入了 InnoDB（事务性数据库引擎），MySQL 5.5 版本后默认的存储引擎为 InnoDB。

大多数时候我们使用的都是 InnoDB 存储引擎，但是在某些情况下使用 MyISAM 也是合适的比如读密集的情况下。（如果你不介意 MyISAM 崩溃恢复问题的话）。

**两者的对比：**

1. **是否支持行级锁** : MyISAM 只有表级锁(table-level locking)，而 InnoDB 支持行级锁(row-level locking)和表级锁,默认为行级锁。
2. **是否支持事务和崩溃后的安全恢复： MyISAM** 强调的是性能，每次查询具有原子性,其执行速度比 InnoDB 类型更快，但是不提供事务支持。但是**InnoDB** 提供事务支持，外部键等高级数据库功能。 具有事务(commit)、回滚(rollback)和崩溃修复能力(crash recovery capabilities)的事务安全(transaction-safe (ACID compliant))型表。
3. **是否支持外键：** MyISAM 不支持，而 InnoDB 支持。
4. **是否支持 MVCC** ：仅 InnoDB 支持。应对高并发事务, MVCC 比单纯的加锁更高效;MVCC 只在 `READ COMMITTED` 和 `REPEATABLE READ` 两个隔离级别下工作;MVCC 可以使用 乐观(optimistic)锁 和 悲观(pessimistic)锁来实现;各数据库中 MVCC 实现并不统一。推荐阅读：[MySQL-InnoDB-MVCC 多版本并发控制](https://segmentfault.com/a/1190000012650596)
5. ......

《MySQL 高性能》上面有一句话这样写到:

> 不要轻易相信“MyISAM 比 InnoDB 快”之类的经验之谈，这个结论往往不是绝对的。在很多我们已知场景中，InnoDB 的速度都可以让 MyISAM 望尘莫及，尤其是用到了聚簇索引，或者需要访问的数据都可以放入内存的应用。

一般情况下我们选择 InnoDB 都是没有问题的，但是某些情况下你并不在乎可扩展能力和并发能力，也不需要事务支持，也不在乎崩溃后的安全恢复问题的话，选择 MyISAM 也是一个不错的选择。但是一般情况下，我们都是需要考虑到这些问题的。

### MEMORY

只对应一个磁盘文件.frm，用来存储表结构

访问速度非常快，因为他的数据存在内存中，但是一旦服务关闭，数据就会丢失

可以指定 Hash 索引或 BTREE 索引

默认存储数据大小不超过 16MB，但可以调整

应用场景：比如作为统计操作的的中间结果表，便于高效地对中间结果分析并得到最终结果。

### MERGE

一组 MyISAM 表的组合，这些 MyISAM 表结构必须完全相同

对 MERGE 表的操作实际上是对其子表进行的

可以通过指定 INSERT_METHOD=LAST 来制定插入数据的表（这里指定为最后一个表）

### 参考

[1] 《深入浅出 MySQL》

[2] 平衡查找树之 B 树：[http://www.cnblogs.com/yangecnu/p/Introduce-B-Tree-and-B-Plus-Tree.html](http://www.cnblogs.com/yangecnu/p/Introduce-B-Tree-and-B-Plus-Tree.html)

[3] B 树，B+树，B\*树：[https://www.jianshu.com/p/db226e0196b4](https://www.jianshu.com/p/db226e0196b4)

## 数据结构

### B 树（B-Tree）

B 树是 2-3 树的一种扩展，对于 M 阶(M 就是树的高度，比如下图为一个四阶的树)的 B 树来说：

（1）根节点至少有两个子节点

（2）每个节点至多有 M-1 个 key，以升序排列，以及 Nk+1 个指针，其中 Nk 代表 key 的数量。

（3）对于一个 key1 来说，它左侧的指针指向的子节点的 key 值<=key1,右侧子指针指向的子节点的 key 值>key1（详见下图）

（4）其他节点至少有 M/2 个子节点

![image](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy8xNDQ2MDg3LWJjMDIzZTQ3YmM3NGNmYTEuanBn?x-oss-process=image/format,png)

他的插入过程和红黑树很相似，总结一下就是：

（1）当要插入一个新值时，首先根据第三条原则找到他在叶子节点的位置并插入

（2）如果当前叶子节点的 key 数目等于 M，那么就要拆分，拆分的过程就是把所有 key 通过一个中间值（如 M=4 取第二个数，M=5 取第三个数），分成相同的两份（如果 M 是偶数会相差一），然后中间数为父节点，两边的树作为左右子节点，但要注意中间数是插入到他们的父节点中的，而不是新生成一棵树，这也就意味着如果这时候父节点的 key 树等于 M，那么就要通过相同的变换把 key 值接着向上传递，直到 key 数<M。

**B 树由来**

> 定义：B-树是一类树，包括 B-树、B+树、B\*树等，是一棵自平衡的搜索树，它类似普通的平衡二叉树，不同的一点是 B-树允许每个节点有更多的子节点。  
> B-树是专门为外部存储器设计的，如磁盘，它对于读取和写入大块数据有良好的性能，所以一般被用在文件系统及数据库中。

定义只需要知道 B-树允许每个节点有更多的子节点即可（多叉树）。子节点数量一般在上千，具体数量依赖外部存储器的特性。

先来看看为什么会出现 B-树这类数据结构。

> 传统用来搜索的平衡二叉树有很多，如 AVL 树，红黑树等。这些树在一般情况下查询性能非常好，但当数据非常大的时候它们就无能为力了。

    原因当数据量非常大时，内存不够用，大部分数据只能存放在磁盘上，只有需要的数据才加载到内存中。一般而言内存访问的时间约为 50 ns，而磁盘在 10 ms 左右。速度相差了近 5 个数量级，磁盘读取时间远远超过了数据在内存中比较的时间。


    这说明程序大部分时间会阻塞在磁盘 IO 上。那么我们如何提高程序性能？减少磁盘 IO 次数，像 AVL 树，红黑树这类平衡二叉树从设计上无法“迎合”磁盘。

![image](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy8xNDQ2MDg3LTI0Njk5ZTFmZTNmYzlhZGY?x-oss-process=image/format,png)

上图是一颗简单的平衡二叉树，平衡二叉树是通过旋转来保持平衡的，而旋转是对整棵树的操作，若部分加载到内存中则无法完成旋转操作。其次平衡二叉树的高度相对较大为 log n（底数为 2），这样逻辑上很近的节点实际可能非常远，无法很好的利用磁盘预读（局部性原理），所以这类平衡二叉树在数据库和文件系统上的选择就被 pass 了。

> 空间局部性原理：如果一个存储器的某个位置被访问，那么将它附近的位置也会被访问。

我们从“迎合”磁盘的角度来看看 B-树的设计。

**索引的效率依赖**与**磁盘 IO** 的次数，**快速索引**需要有效的减少磁盘 IO 次数，如何快速索引呢？

> 索引的原理其实是不断的缩小查找范围，就如我们平时用字典查单词一样，先找首字母缩小范围，再第二个字母等等。

    平衡二叉树是每次将范围分割为两个区间。为了更快，B-树每次将范围分割为多个区间，区间越多，定位数据越快越精确。那么如果节点为区间范围，每个节点就较大了。所以新建节点时，直接申请页大小的空间（磁盘存储单位是按 block 分的，一般为 512 Byte。


    磁盘 IO 一次读取若干个 block，我们称为一页，具体大小和操作系统有关，一般为 4 k，8 k或 16 k），计算机内存分配是按页对齐的，这样就实现了一个节点只需要一次 IO。

![image](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy8xNDQ2MDg3LWI2ZDQ3NTQzMDRmYTg5NTU?x-oss-process=image/format,png)

上图是一棵简化的 B-树，多叉的好处非常明显，有效的降低了 B-树的高度，为底数很大的 log n，底数大小与节点的子节点数目有关，一般一棵 B-树的高度在 3 层左右。

层数低，每个节点区确定的范围更精确，范围缩小的速度越快（比二叉树深层次的搜索肯定快很多）。上面说了一个节点需要进行一次 IO，那么总 IO 的次数就缩减为了 log n 次。B-树的每个节点是 n 个有序的序列(a1,a2,a3…an)，并将该节点的子节点分割成 n+1 个区间来进行索引(X1< a1, a2 < X2 < a3, … , an+1 < Xn < anXn+1 > an)。

> 点评：B 树的每个节点，都是存多个值的，不像二叉树那样，一个节点就一个值，B 树把每个节点都给了一点的范围区间，区间更多的情况下，搜索也就更快了，比如：有 1-100 个数，二叉树一次只能分两个范围，0-50 和 51-100，而 B 树，分成 4 个范围 1-25， 25-50，51-75，76-100 一次就能筛选走四分之三的数据。所以作为多叉树的 B 树是更快的

### B+Tree（树）

存储引擎常用的一种数据结构，一种多叉平衡查找树，特点（对于 M 阶的 B+树）：

（1）除叶子结点外所有节点都有 M 个键以及 M 个指向子节点的指针。

（2）所有叶子节点都在同一层

（3）非叶子结点的子树指针与关键字（Key）个数相同；

（4）非叶子结点的子树指针 P[i]，指向关键字值属于[K[i], K[i+1])的子树（B-树是开区间）；

（5）为所有叶子结点增加一个链指针；

（6）所有关键字（key）都在叶子结点出现；，因此所有查找只会在叶子结点命中

结构如下图所示：

![image](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy8xNDQ2MDg3LTMwYjcwYWFhMjg0MDM4MDMuanBn?x-oss-process=image/format,png)

![image](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy8xNDQ2MDg3LTJhYTFjMTdkMTY4OGI3OTk?x-oss-process=image/format,png)

**因为内节点并不存储 data，所以一般 B+树的叶节点和内节点大小不同，而 B-树的每个节点大小一般是相同的，为一页。**

为了增加 **区间访问性**，一般会对 B+树做一些优化。
如下图带顺序访问的 B+树。

![image](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy8xNDQ2MDg3LTg5MTkwOTQzNzk0M2Q4ODg?x-oss-process=image/format,png)

**相比 B 树的优点：**

（1）支持范围查找

（2）遍历更方便

（3）节省空间：因为 B+树只有叶子节点才存数据，因此内部节点不需要只想关键字具体信息的指针。

（4）所有查询操作都需要命中子节点，所以是相同的。

> PS: B\*树就是在 B+树基础上，为非叶子结点也增加链表指针

### B 树与 B+Tree 的区别

1 . **B+树内节点不存储数据，所有 data 存储在叶节点导致查询时间复杂度固定为 log n。而 B-树查询时间复杂度不固定，与 key 在树中的位置有关，最好为 O(1)。**

如下所示 B-树/B+树查询节点 key 为 50 的 data。

B-树：

![image](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy8xNDQ2MDg3LWQ2MmVjNmU4M2VlYmUwNmY?x-oss-process=image/format,png)

> 从上图可以看出，key 为 50 的节点就在第一层，B-树只需要一次磁盘 IO 即可完成查找。所以说 B-树的查询最好时间复杂度是 O(1)。

B+树：

![image](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy8xNDQ2MDg3LWQ2OTBmYWJlOGM5MTkyODE?x-oss-process=image/format,png)

**由于 B+树所有的 data 域都在根节点，所以查询 key 为 50 的节点必须从根节点索引到叶节点，时间复杂度固定为 O(log n)。**

> 点评：B 树的由于每个节点都有 key 和 data，所以查询的时候可能不需要 O(logn)的复杂度，甚至最好的情况是 O(1)就可以找到数据，而 B+树由于只有叶子节点保存了 data，所以必须经历 O(logn)复杂度才能找到数据

1. **B+树叶节点两两相连可大大增加区间访问性，可使用在范围查询等，而 B-树每个节点 key 和 data 在一起，则无法区间查找。**

`根据空间局部性原理`：如果一个存储器的某个位置被访问，那么将它附近的位置也会被访问。

> B+树可以很好的利用局部性原理，若我们访问节点 key 为 50，则 key 为 55、60、62 的节点将来也可能被访问，我们可以利用磁盘预读原理提前将这些数据读入内存，减少了磁盘 IO 的次数。  
> 当然 B+树也能够很好的完成范围查询。比如查询 key 值在 50-70 之间的节点。

> 点评：由于 B+树的叶子节点的数据都是使用链表连接起来的，而且他们在磁盘里是顺序存储的，所以当读到某个值的时候，磁盘预读原理就会提前把这些数据都读进内存，使得范围查询和排序都很快

1. **B+树更适合外部存储。由于内节点无 data 域，每个节点能索引的范围更大更精确**

这个很好理解，由于 B-树节点内部每个 key 都带着 data 域，而 B+树节点只存储 key 的副本，真实的 key 和 data 域都在叶子节点存储。

      前面说过磁盘是分 block 的，一次磁盘 IO 会读取若干个 block，具体和操作系统有关，那么由于磁盘 IO 数据大小是固定的，在一次 IO 中，单个元素越小，量就越大。

这就意味着 B+树单次磁盘 IO 的信息量大于 B-树，从这点来看 B+树相对 B-树磁盘 IO 次数少。

> 点评：由于 B 树的节点都存了 key 和 data，而 B+树只有叶子节点存 data，非叶子节点都只是索引值，没有实际的数据，这就时 B+树在一次 IO 里面，能读出的索引值更多。从而减少查询时候需要的 IO 次数！

![image](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy8xNDQ2MDg3LTBmNmUxZjdiODkyMWI2ZjM?x-oss-process=image/format,png)

> 从上图可以看出相同大小的区域，B-树仅有 2 个 key，而 B+树有 3 个 key。

### 为什么使用 B-Tree（B+Tree）

      `上文说过，红黑树等数据结构也可以用来实现索引，但是文件系统及数据库系统普遍采用B-/+Tree作为索引结构，这一节将结合计算机组成原理相关知识讨论B-/+Tree作为索引的理论基础。`

> 一般来说，索引本身也很大，不可能全部存储在内存中，因此索引往往以索引文件的形式存储的磁盘上。这样的话，索引查找过程中就要产生磁盘 I/O 消耗，相对于内存存取，I/O 存取的消耗要高几个数量级，所以评价一个数据结构作为索引的优劣最重要的指标就是在查找过程中磁盘 I/O 操作次数的渐进复杂度。

    换句话说，索引的结构组织要尽量减少查找过程中磁盘I/O的存取次数。下面先介绍内存和磁盘存取原理，然后再结合这些原理分析B-/+Tree作为索引的效率。

### 存储数据最小单元

我们都知道计算机在存储数据的时候，有最小存储单元，这就好比我们今天进行现金的流通最小单位是一毛。

在计算机中磁盘存储数据最小单元是扇区，一个扇区的大小是 512 字节，而文件系统（例如 XFS/EXT4）他的最小单元是块，一个块的大小是 4k

而对于我们的 InnoDB 存储引擎也有自己的最小储存单元——页（Page），一个页的大小是 16K。

下面几张图可以帮你理解最小存储单元：

文件系统中一个文件大小只有 1 个字节，但不得不占磁盘上 4KB 的空间。

磁盘扇区、文件系统、InnoDB 存储引擎都有各自的最小存储单元。

![image](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy8xNDQ2MDg3LTAyMzJiODIzZTNmMWViM2E?x-oss-process=image/format,png)

在 MySQL 中我们的 InnoDB 页的大小默认是 16k，当然也可以通过参数设置：

![image](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy8xNDQ2MDg3LWVkNzFhNWIzZWVmNDMxZGM?x-oss-process=image/format,png)

> 数据表中的数据都是存储在页中的，所以一个页中能存储多少行数据呢？假设一行数据的大小是 1k，那么一个页可以存放 16 行这样的数据。

### 主存存取原理

目前计算机使用的主存基本都是随机读写存储器（RAM），现代 RAM 的结构和存取原理比较复杂，这里本文抛却具体差别，抽象出一个十分简单的存取模型来说明 RAM 的工作原理。

![image](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy8xNDQ2MDg3LTBmODlkNzBlYTM0YTI1OTkucG5n?x-oss-process=image/format,png)

`从抽象角度看`，主存是一系列的存储单元组成的矩阵，每个存储单元存储固定大小的数据。每个存储单元有唯一的地址，现代主存的编址规则比较复杂

    这里将其简化成一个`二维地址`：通过一个行地址和一个列地址可以唯一定位到一个存储单元。图5展示了一个4 x 4的主存模型。

**主存的存取过程如下：**

> 当系统需要读取主存时，则将地址信号放到地址总线上传给主存，主存读到地址信号后，解析信号并定位到指定存储单元，然后将此存储单元数据放到数据总线上，供其它部件读取。

> 写主存的过程类似，系统将要写入单元地址和数据分别放在地址总线和数据总线上，主存读取两个总线的内容，做相应的写操作。

这里可以看出，主存存取的时间仅与存取次数呈线性关系，因为不存在机械操作，两次存取的数据的“距离”不会对时间有任何影响，例如，先取 A0 再取 A1 和先取 A0 再取 D3 的时间消耗是一样的。

### 磁盘存取原理

上文说过，索引一般以文件形式存储在磁盘上，索引检索需要磁盘 I/O 操作。与主存不同，磁盘 I/O 存在机械运动耗费，因此磁盘 I/O 的时间消耗是巨大的。

图 6 是磁盘的整体结构示意图。

![image](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy8xNDQ2MDg3LTA3Njg5ZDJjNTM5YzY1MGIucG5n?x-oss-process=image/format,png)

一个磁盘由大小相同且同轴的圆形盘片组成，磁盘可以转动（各个磁盘必须同步转动）。在磁盘的一侧有磁头支架，磁头支架固定了一组磁头，每个磁头负责存取一个磁盘的内容。磁头不能转动，但是可以沿磁盘半径方向运动（实际是斜切向运动），每个磁头同一时刻也必须是同轴的，即从正上方向下看，所有磁头任何时候都是重叠的（不过目前已经有多磁头独立技术，可不受此限制）。

图 7 是磁盘结构的示意图。

![image](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy8xNDQ2MDg3LWZiZDUyMTlkMmVkNWQ3YzUucG5n?x-oss-process=image/format,png)

盘片被划分成一系列同心环，圆心是盘片中心，每个同心环叫做一个磁道，所有半径相同的磁道组成一个柱面。磁道被沿半径线划分成一个个小的段，**每个段叫做一个扇区，每个扇区是磁盘的最小存储单元**。为了简单起见，我们下面假设磁盘只有一个盘片和一个磁头。

> 当需要从磁盘读取数据时，系统会将数据逻辑地址传给磁盘，磁盘的控制电路按照寻址逻辑将逻辑地址翻译成物理地址，即确定要读的数据在哪个磁道，哪个扇区。

        为了读取这个扇区的数据，需要将磁头放到这个扇区上方，为了实现这一点，磁头需要移动对准相应磁道，这个过程叫做寻道，所耗费时间叫做寻道时间，然后磁盘旋转将目标扇区旋转到磁头下，这个过程耗费的时间叫做旋转时间。

### 局部性原理与磁盘预读

> 由于存储介质的特性，磁盘本身存取就比主存慢很多，再加上机械运动耗费，磁盘的存取速度往往是主存的几百分分之一，因此为了提高效率，要尽量减少磁盘 I/O。为了达到这个目的，磁盘往往不是严格按需读取，而是每次都会预读，即使只需要一个字节，磁盘也会从这个位置开始，顺序向后读取一定长度的数据放入内存。这样做的理论依据是计算机科学中著名的局部性原理：

当一个数据被用到时，其附近的数据也通常会马上被使用。

程序运行期间所需要的数据通常比较集中。

由于磁盘顺序读取的效率很高（不需要寻道时间，只需很少的旋转时间），因此对于具有局部性的程序来说，预读可以提高 I/O 效率。

预读的长度一般为页（page）的整倍数。页是计算机管理存储器的逻辑块，硬件及操作系统往往将主存和磁盘存储区分割为连续的大小相等的块，每个存储块称为一页（在许多操作系统中，页得大小通常为 4k），主存和磁盘以页为单位交换数据。当程序要读取的数据不在主存中时，会触发一个缺页异常，此时系统会向磁盘发出读盘信号，磁盘会找到数据的起始位置并向后连续读取一页或几页载入内存中，然后异常返回，程序继续运行。

**所以 IO 一次就是读一页的大小**

## 索引

MySQL 索引使用的数据结构主要有**BTree 索引** 和 **哈希索引** 。对于哈希索引来说，底层的数据结构就是哈希表，因此在绝大多数需求为单条记录查询的时候，可以选择哈希索引，查询性能最快；其余大部分场景，建议选择 BTree 索引。

MySQL 的 BTree 索引使用的是 B 树中的 B+Tree，但对于主要的两种存储引擎的实现方式是不同的。

- **MyISAM:** B+Tree 叶节点的 data 域存放的是数据记录的地址。在索引检索的时候，首先按照 B+Tree 搜索算法搜索索引，如果指定的 Key 存在，则取出其 data 域的值，然后以 data 域的值为地址读取相应的数据记录。这被称为“非聚簇索引”。
- **InnoDB:** 其数据文件本身就是索引文件。相比 MyISAM，索引文件和数据文件是分离的，其表数据文件本身就是按 B+Tree 组织的一个索引结构，树的叶节点 data 域保存了完整的数据记录。这个索引的 key 是数据表的主键，因此 InnoDB 表数据文件本身就是主索引。这被称为“聚簇索引（或聚集索引）”。而其余的索引都作为辅助索引，辅助索引的 data 域存储相应记录主键的值而不是地址，这也是和 MyISAM 不同的地方。**在根据主索引搜索时，直接找到 key 所在的节点即可取出数据；在根据辅助索引查找时，则需要先取出主键的值，再走一遍主索引。** **因此，在设计表的时候，不建议使用过长的字段作为主键，也不建议使用非单调的字段作为主键，这样会造成主索引频繁分裂。** PS：整理自《Java 工程师修炼之道》

### Hash 索引

> Hash 索引结构的特殊性，其检索效率非常高，索引的检索可以一次定位，不像 B-Tree 索引需要从根节点到枝节点，最后才能访问到页节点这样多次的 IO 访问，所以 Hash 索引的查询效率要远高于 B-Tree 索引。

可 能很多人又有疑问了，既然 Hash 索引的效率要比 B-Tree 高很多，为什么大家不都用 Hash 索引而还要使用 B-Tree 索引呢？任何事物都是有两面性的，Hash 索引也一样，虽然 Hash 索引效率高，但是 Hash 索引本身由于其特殊性也带来了很多限制和弊端，主要有以下这些。

（1）Hash 索引仅仅能满足"=","IN"和"<=>"查询，不能使用范围查询。

> 由于 Hash 索引比较的是进行 Hash 运算之后的 Hash 值，所以它只能用于等值的过滤，不能用于基于范围的过滤，因为经过相应的 Hash 算法处理之后的 Hash 值的大小关系，并不能保证和 Hash 运算前完全一样。

（2）Hash 索引无法被用来避免数据的排序操作。

> 由于 Hash 索引中存放的是经过 Hash 计算之后的 Hash 值，而且 Hash 值的大小关系并不一定和 Hash 运算前的键值完全一样，所以数据库无法利用索引的数据来避免任何排序运算；

（3）Hash 索引不能利用部分索引键查询。

> 对于组合索引，Hash 索引在计算 Hash 值的时候是组合索引键合并后再一起计算 Hash 值，而不是单独计算 Hash 值，所以通过组合索引的前面一个或几个索引键进行查询的时候，Hash 索引也无法被利用。

（4）Hash 索引在任何时候都不能避免表扫描。

> 前面已经知道，Hash 索引是将索引键通过 Hash 运算之后，将 Hash 运算结果的 Hash 值和所对应的行指针信息存放于一个 Hash 表中，由于不同索引键存在相同 Hash 值，所以即使取满足某个 Hash 键值的数据的记录条数，也无法从 Hash 索引中直接完成查询，还是要通过访问表中的实际数据进行相应的比较，并得到相应的结果。

（5）Hash 索引遇到大量 Hash 值相等的情况后性能并不一定就会比 B-Tree 索引高。

> 对于选择性比较低的索引键，如果创建 Hash 索引，那么将会存在大量记录指针信息存于同一个 Hash 值相关联。这样要定位某一条记录时就会非常麻烦，会浪费多次表数据的访问，而造成整体性能低下。

(6) hash 索引查找数据基本上能一次定位数据，当然有大量碰撞的话性能也会下降。而 btree 索引就得在节点上挨着查找了，很明显在数据精确查找方面 hash 索引的效率是要高于 btree 的；

(7) 那么不精确查找呢，也很明显，因为 hash 算法是基于等值计算的，所以对于“like”等范围查找 hash 索引无效，不支持；

(8) 对于 btree 支持的联合索引的最优前缀，hash 也是无法支持的，联合索引中的字段要么全用要么全不用。提起最优前缀居然都泛起迷糊了，看来有时候放空得太厉害；

(9) hash 不支持索引排序，索引值和计算出来的 hash 值大小并不一定一致。

### B-Tree 索引

B-tree 索引可以用于使用 =, >, >=, <, <= 或者 BETWEEN 运算符的列比较。如果 LIKE 的参数是一个没有以通配符起始的常量字符串的话也可以使用这种索引。比如，以下 SELECT 语句就使用索引：

```text
1.  SELECT * FROM tbl_name WHERE key_col LIKE 'Patrick%';
2.  SELECT * FROM tbl_name WHERE key_col LIKE 'Pat%_ck%';

```

在第一个句子中，只会考虑 'Patrick' <= key_col < 'Patricl' 的记录。第二句中，则只会考虑 'Pat' <= key_col < 'Pau' 的记录。
以下 SELECT 语句不使用索引：

```text
1.  SELECT * FROM tbl_name WHERE key_col LIKE '%Patrick%';
2.  SELECT * FROM tbl_name WHERE key_col LIKE other_col;

```

第一句里面，LIKE 的值起始于一个通配符。在第二句里，LIKE 的值不是一个常量。如果你这样使用： ... LIKE '%string%'，其中的 string 不大于三个字符，MySql 将使用 Turbo Boyer-Moore 算法来对该字符串表达式进行初始化，并使用这种表达式来让查询更加迅速。如果 col_name 列创建了索引，那么一个使用了 col_name IS NULL 的查询是可以使用该索引的。任何没有涵盖 WHERE 从句中所有 AND 级别的条件的索引将不会被使用。换句话讲，要想使用索引，该索引的前导列必须在每一个 AND 组合中使用到。
以下 WHERE 从句使用索引：

```text
1.  ... WHERE index_part1=1 AND index_part2=2 AND other_column=3

4.  /* index = 1 OR index = 2 */
5.  ... WHERE index=1 OR A=10 AND index=2

8.  /* optimized like "index_part1='hello'" */
9.  ... WHERE index_part1='hello' AND index_part3=5

12.  /* Can use index on index1 but not on index2 or index3 */
13.  ... WHERE index1=1 AND index2=2 OR index1=3 AND index3=3;

```

这些 WHERE 从句不使用索引：

```text
1.  /* index_part1 is not used */
2.  WHERE index_part2=1 AND index_part3=2

5.  /*  Index is not used in both parts of the WHERE clause  */
6.  WHERE index=1 OR A=10

9.  /* No index spans all rows  */
10.  WHERE index_part1=1 OR index_part2=10

```

有时，即使有索引可以使用，[MySQL](http://lib.csdn.net/base/mysql) 也不使用任何索引。发生这种情况的场景之一就是优化器估算出使用该索引将要求 MySql 去访问这张表的绝大部分记录。这种情况下，一个表扫描可能更快，因为它要求更少量的查询。但是，如果这样的一个查询使用了 LIMIT 来检索只是少量的记录时，MySql 还是会使用索引，因为它能够更快地找到这点记录并将其返回。

## 事务

**事务是逻辑上的一组操作，要么都执行，要么都不执行。**

事务最经典也经常被拿出来说例子就是转账了。假如小明要给小红转账 1000 元，这个转账会涉及到两个关键操作就是：将小明的余额减少 1000 元，将小红的余额增加 1000 元。万一在这两个操作之间突然出现错误比如银行系统崩溃，导致小明余额减少而小红的余额没有增加，这样就不对了。事务就是保证这两个关键操作要么都成功，要么都要失败。

### [事务的四大特性(ACID)](https://snailclimb.gitee.io/javaguide/#/docs/database/MySQL?id=%E4%BA%8B%E5%8A%A1%E7%9A%84%E5%9B%9B%E5%A4%A7%E7%89%B9%E6%80%A7acid)

![image.png](https://blog-file.hehouhui.cn/image.png)

> 事务处理可以确保除非事务性单元内的所有操作都成功完成，否则不会永久更新面向数据的资源。通过将一组相关操作组合为一个要么全部成功要么全部失败的单元，可以简化错误恢复并使应用程序更加可靠。一个逻辑工作单元要成为事务，必须满足所谓的 ACID(原子性、一致性、隔离性和持久性)属性：

1. **原子性(Atomicity)**

   事务是最小的执行单位，不允许分割。事务的原子性确保动作要么全部完成，要么完全不起作用；

   > 事务必须是原子工作单元；对于其数据修改，要么全都执行，要么全都不执行。通常，与某个事务关联的操作具有共同的目标，并且是相互依赖的。如果系统只执行这些操作的一个子集，则可能会破坏事务的总体目标。原子性消除了系统处理操作子集的可能性。

2. **一致性(Consistency)**

   执行事务后，数据库从一个正确的状态变化到另一个正确的状态；

   > 事务在完成时，必须使所有的数据都保持一致状态。在相关数据库中，所有规则都必须应用于事务的修改，以保持所有数据的完整性。事务结束时，所有的内部数据结构（如 B 树索引或双向链表）都必须是正确的。某些维护一致性的责任由应用程序开发人员承担，他们必须确保应用程序已强制所有已知的完整性约束。例如，当开发用于转帐的应用程序时，应避免在转帐过程中任意移动小数点。

3. **隔离性(Isolation)**

   并发访问数据库时，一个用户的事务不被其他事务所干扰，各并发事务之间数据库是独立的；

> 由并发事务所作的修改必须与任何其它并发事务所作的修改隔离。事务查看数据时数据所处>的状态，要么是另一并发事务修改它之前的状态，要么是另一事务修改它之后的状态，事务不会查看中间状态的数据。这称为可串行性，因为它能够重新装载起始数据，并且重播一系列事务，以使数据结束时的状态与原始事务执行的状态相同。当事务可序列化时将获得最高的隔离级别。在此级别上，从一组可并行执行的事务获得的结果与通过连续运行每个事务所获得的结果相同。由于高度隔离会限制可并行执行的事务数，所以一些应用程序降低隔离级别以换取更大的吞吐量。

1. · **持久性(Durability）**

   一个事务被提交之后。它对数据库中数据的改变是持久的，即使数据库发生故障也不应该对其有任何影响。

   > 事务完成之后，它对于系统的影响是永久性的。该修改即使出现致命的系统故障也将一直保持。

### [并发事务带来哪些问题?](https://snailclimb.gitee.io/javaguide/#/docs/database/MySQL?id=%E5%B9%B6%E5%8F%91%E4%BA%8B%E5%8A%A1%E5%B8%A6%E6%9D%A5%E5%93%AA%E4%BA%9B%E9%97%AE%E9%A2%98)

在典型的应用程序中，多个事务并发运行，经常会操作相同的数据来完成各自的任务（多个用户对同一数据进行操作）。并发虽然是必须的，但可能会导致以下的问题。

- **脏读（Dirty read）:** 当一个事务正在访问数据并且对数据进行了修改，而这种修改还没有提交到数据库中，这时另外一个事务也访问了这个数据，然后使用了这个数据。因为这个数据是还没有提交的数据，那么另外一个事务读到的这个数据是“脏数据”，依据“脏数据”所做的操作可能是不正确的。
- **丢失修改（Lost to modify）:** 指在一个事务读取一个数据时，另外一个事务也访问了该数据，那么在第一个事务中修改了这个数据后，第二个事务也修改了这个数据。这样第一个事务内的修改结果就被丢失，因此称为丢失修改。 例如：事务 1 读取某表中的数据 A=20，事务 2 也读取 A=20，事务 1 修改 A=A-1，事务 2 也修改 A=A-1，最终结果 A=19，事务 1 的修改被丢失。
- **不可重复读（Unrepeatableread）:** 指在一个事务内多次读同一数据。在这个事务还没有结束时，另一个事务也访问该数据。那么，在第一个事务中的两次读数据之间，由于第二个事务的修改导致第一个事务两次读取的数据可能不太一样。这就发生了在一个事务内两次读到的数据是不一样的情况，因此称为不可重复读。
- **幻读（Phantom read）:** 幻读与不可重复读类似。它发生在一个事务（T1）读取了几行数据，接着另一个并发事务（T2）插入了一些数据时。在随后的查询中，第一个事务（T1）就会发现多了一些原本不存在的记录，就好像发生了幻觉一样，所以称为幻读。

**不可重复读和幻读区别：**

不可重复读的重点是修改比如多次读取一条记录发现其中某些列的值被修改，幻读的重点在于新增或者删除比如多次读取一条记录发现记录增多或减少了。

### [事务隔离级别有哪些?MySQL 的默认隔离级别是?](https://snailclimb.gitee.io/javaguide/#/docs/database/MySQL?id=%E4%BA%8B%E5%8A%A1%E9%9A%94%E7%A6%BB%E7%BA%A7%E5%88%AB%E6%9C%89%E5%93%AA%E4%BA%9Bmysql%E7%9A%84%E9%BB%98%E8%AE%A4%E9%9A%94%E7%A6%BB%E7%BA%A7%E5%88%AB%E6%98%AF)

**SQL 标准定义了四个隔离级别：**

- **READ-UNCOMMITTED(读取未提交)：** 最低的隔离级别，允许读取尚未提交的数据变更，**可能会导致脏读、幻读或不可重复读**。
- **READ-COMMITTED(读取已提交)：** 允许读取并发事务已经提交的数据，**可以阻止脏读，但是幻读或不可重复读仍有可能发生**。
- **REPEATABLE-READ(可重复读)：** 对同一字段的多次读取结果都是一致的，除非数据是被本身事务自己所修改，**可以阻止脏读和不可重复读，但幻读仍有可能发生**。
- **SERIALIZABLE(可串行化)：** 最高的隔离级别，完全服从 ACID 的隔离级别。所有的事务依次逐个执行，这样事务之间就完全不可能产生干扰，也就是说，**该级别可以防止脏读、不可重复读以及幻读**。

---

| 隔离级别         | 脏读 | 不可重复读 | 幻影读 |
| ---------------- | ---- | ---------- | ------ |
| READ-UNCOMMITTED | √    | √          | √      |
| READ-COMMITTED   | ×    | √          | √      |
| REPEATABLE-READ  | ×    | ×          | √      |
| SERIALIZABLE     | ×    | ×          | ×      |

MySQL InnoDB 存储引擎的默认支持的隔离级别是 **REPEATABLE-READ（可重读）**。我们可以通过`SELECT @@tx_isolation;`命令来查看，MySQL 8.0 该命令改为`SELECT @@transaction_isolation;`

### **事务保存点(SavePoint)**

> 有一个数据库管理员，在早上的时候，设置了一个保存点 a1，然后工作（对数据库进行增删改查），到了中午他又设置了一个保存点 a2，到了下午他又继续工作（还是对数据库进行增删改查），然后到了晚上。突然之间，他执行了一个很愚蠢的操作，把数据库里的数据全部给删除了！！！！

那这个时候怎么办呢？好在他在早上和中午的时候设置了保存点，然后只要回到保存点就可以了。

rollback to xxxSavePoint

当事务 commit 之后，事务中设置的 SavePoint 就取消了

### **事务并发**

两个并发事务同时访问数据库表相同的行时，可能存在以下三个问题：

1、`幻想读`：事务 T1 读取一条指定 where 条件的语句，返回结果集。此时事务 T2 插入一行新记录，恰好满足 T1 的 where 条件。然后 T1 使用相同的条件再次查询，结果集中可以看到 T2 插入的记录，这条新纪录就是幻想。

2、`不可重复读取`：事务 T1 读取一行记录，紧接着事务 T2 修改了 T1 刚刚读取的记录，然后 T1 再次查询，发现与第一次读取的记录不同，这称为不可重复读。

3、`脏读`：事务 T1 更新了一行记录，还未提交所做的修改，这个 T2 读取了更新后的数据，然后 T1 执行回滚操作，取消刚才的修改，所以 T2 所读取的行就无效，也就是脏数据。

### 事务实现原理

**数据库系统是通过并发控制技术和日志恢复技术来避免这种情况发生的。**

> 并发控制技术保证了事务的隔离性,使数据库的一致性状态不会因为并发执行的操作被破坏。  
> 日志恢复技术保证了事务的原子性,使一致性状态不会因事务或系统故障被破坏。同时使已提交的对数据库的修改不会因系统崩溃而丢失,保证了事务的持久性。

![20220221101406.png](https://blog-file.hehouhui.cn/20220221101406.png)

### 并发异常

> 在讲解并发控制技术前,先简单介绍下数据库常见的并发异常。

### 脏写

脏写是指事务回滚了其他事务对数据项的已提交修改,比如下面这种情况

![20220221101453.png](https://blog-file.hehouhui.cn/20220221101453.png)

### 丢失更新

- 丢失更新是指事务覆盖了其他事务对数据的已提交修改,导致这些修改好像丢失了一样。

  ![20220221101626.png](https://blog-file.hehouhui.cn/20220221101626.png)

事务 1 和事务 2 读取 A 的值都为 10,事务 2 先将 A 加上 10 并提交修改,之后事务 2 将 A 减少 10 并提交修改,A 的值最后为,导致事务 2 对 A 的修改好像丢失了一样

### 脏读

- 脏读是指一个事务读取了另一个事务未提交的数据

  ![20220221101652.png](https://blog-file.hehouhui.cn/20220221101652.png)

在事务 1 对 A 的处理过程中,事务 2 读取了 A 的值,但之后事务 1 回滚,导致事务 2 读取的 A 是未提交的脏数据。

### 不可重复读

- 不可重复读是指一个事务对同一数据的读取结果前后不一致。脏读和不可重复读的区别在于:前者读取的是事务未提交的脏数据,后者读取的是事务已经提交的数据,只不过因为数据被其他事务修改过导致前后两次读取的结果不一样,比如下面这种情况

  ![1422237-20181122103147288-996731595.png](https://blog-file.hehouhui.cn/1422237-20181122103147288-996731595.png)

由于事务 2 对 A 的已提交修改,事务 1 前后两次读取的结果不一致。

### 幻读

- 幻读是指事务读取某个范围的数据时，因为其他事务的操作导致前后两次读取的结果不一致。幻读和不可重复读的区别在于,不可重复读是针对确定的某一行数据而言,而幻读是针对不确定的多行数据。因而幻读通常出现在带有查询条件的范围查询中,比如下面这种情况:

  ![1422237-20181122103158043-533492513.png](https://blog-file.hehouhui.cn/1422237-20181122103158043-533492513.png)

事务 1 查询 A<5 的数据,由于事务 2 插入了一条 A=4 的数据,导致事务 1 两次查询得到的结果不一样

### 并发控制

> 并发控制技术是实现事务隔离性以及不同隔离级别的关键,实现方式有很多,按照其对可能冲突的操作采取的不同策略可以分为乐观并发控制和悲观并发控制两大类。

- 乐观并发控制:对于并发执行可能冲突的操作,假定其不会真的冲突,允许并发执行,直到真正发生冲突时才去解决冲突,比如让事务回滚。
- 悲观并发控制:对于并发执行可能冲突的操作,假定其必定发生冲突,通过让事务等待(锁)或者中止(时间戳排序)的方式使并行的操作串行执行。

### 基于封锁的并发控制

核心思想:对于并发可能冲突的操作,比如读-写,写-读,写-写,通过锁使它们互斥执行。
锁通常分为共享锁和排他锁两种类型

- 1.共享锁(S):事务 T 对数据 A 加共享锁,其他事务只能对 A 加共享锁但不能加排他锁。
- 2.排他锁(X):事务 T 对数据 A 加排他锁,其他事务对 A 既不能加共享锁也不能加排他锁

基于锁的并发控制流程:

1. 事务根据自己对数据项进行的操作类型申请相应的锁(读申请共享锁,写申请排他锁)
2. 申请锁的请求被发送给锁管理器。锁管理器根据当前数据项是否已经有锁以及申请的和持有的锁是否冲突决定是否为该请求授予锁。
3. 若锁被授予,则申请锁的事务可以继续执行;若被拒绝,则申请锁的事务将进行等待,直到锁被其他事务释放。

可能出现的问题:

- 死锁:多个事务持有锁并互相循环等待其他事务的锁导致所有事务都无法继续执行。
- 饥饿:数据项 A 一直被加共享锁,导致事务一直无法获取 A 的排他锁。

对于可能发生冲突的并发操作,锁使它们由并行变为串行执行,是一种悲观的并发控制。

### 基于时间戳的并发控制

核心思想:对于并发可能冲突的操作,基于时间戳排序规则选定某事务继续执行,其他事务回滚。

系统会在每个事务开始时赋予其一个时间戳,这个时间戳可以是系统时钟也可以是一个不断累加的计数器值,当事务回滚时会为其赋予一个新的时间戳,先开始的事务时间戳小于后开始事务的时间戳。

每一个数据项 Q 有两个时间戳相关的字段:
W-timestamp(Q):成功执行 write(Q)的所有事务的最大时间戳
R-timestamp(Q):成功执行 read(Q)的所有事务的最大时间戳

时间戳排序规则如下:

1. 假设事务 T 发出 read(Q),T 的时间戳为 TS
   a.若 TS(T)<W-timestamp(Q),则 T 需要读入的 Q 已被覆盖。此
   read 操作将被拒绝,T 回滚。
   b.若 TS(T)>=W-timestamp(Q),则执行 read 操作,同时把
   R-timestamp(Q)设置为 TS(T)与 R-timestamp(Q)中的最大值
2. 假设事务 T 发出 write(Q)
   a.若 TS(T)<R-timestamp(Q),write 操作被拒绝,T 回滚。
   b.若 TS(T)<W-timestamp(Q),则 write 操作被拒绝,T 回滚。
   c.其他情况:系统执行 write 操作,将 W-timestamp(Q)设置
   为 TS(T)。

基于时间戳排序和基于锁实现的本质一样:对于可能冲突的并发操作,以串行的方式取代并发执行,因而它也是一种悲观并发控制。它们的区别主要有两点:

- 基于锁是让冲突的事务进行等待,而基于时间戳排序是让冲突的事务回滚。
- 基于锁冲突事务的执行次序是根据它们申请锁的顺序,先申请的先执行;而基于时间戳排序是根据特定的时间戳排序规则。

### 基于有效性检查的并发控制

核心思想:事务对数据的更新首先在自己的工作空间进行,等到要写回数据库时才进行有效性检查,对不符合要求的事务进行回滚。

基于有效性检查的事务执行过程会被分为三个阶段:

1. 读阶段:数据项被读入并保存在事务的局部变量中。所有 write 操作都是对局部变量进行,并不对数据库进行真正的更新。
2. 有效性检查阶段:对事务进行有效性检查,判断是否可以执行 write 操作而不违反可串行性。如果失败,则回滚该事务。
3. 写阶段:事务已通过有效性检查,则将临时变量中的结果更新到数据库中。

有效性检查通常也是通过对事务的时间戳进行比较完成的,不过和基于时间戳排序的规则不一样。

该方法允许可能冲突的操作并发执行,因为每个事务操作的都是自己工作空间的局部变量,直到有效性检查阶段发现了冲突才回滚。因而这是一种乐观的并发策略。

### 基于快照隔离的并发控制

快照隔离是多版本并发控制(mvcc)的一种实现方式。

其核心思想是:数据库为每个数据项维护多个版本(快照),每个事务只对属于自己的私有快照进行更新,在事务真正提交前进行有效性检查,使得事务正常提交更新或者失败回滚。

由于快照隔离导致事务看不到其他事务对数据项的更新,为了避免出现丢失更新问题,可以采用以下两种方案避免：

- 先提交者获胜:对于执行该检查的事务 T,判断是否有其他事务已经将更新写入数据库,是则 T 回滚否则 T 正常提交。
- 先更新者获胜:通过锁机制保证第一个获得锁的事务提交其更新,之后试图更新的事务中止。

事务间可能冲突的操作通过数据项的不同版本的快照相互隔离,到真正要写入数据库时才进行冲突检测。因而这也是一种乐观并发控制。

### 事务的执行过程以及可能产生的问题

![1422237-20181122103254113-1342077140.png](https://blog-file.hehouhui.cn/1422237-20181122103254113-1342077140.png)

事务的执行过程可以简化如下:

1. 系统会为每个事务开辟一个私有工作区
2. 事务读操作将从磁盘中拷贝数据项到工作区中,在执行写操作前所有的更新都作用于工作区中的拷贝.
3. 事务的写操作将把数据输出到内存的缓冲区中,等到合适的时间再由缓冲区管理器将数据写入到磁盘。

由于数据库存在立即修改和延迟修改,所以在事务执行过程中可能存在以下情况:

- 在事务提交前出现故障,但是事务对数据库的部分修改已经写入磁盘数据库中。这导致了事务的原子性被破坏。
- 在系统崩溃前事务已经提交,但数据还在内存缓冲区中,没有写入磁盘。系统恢复时将丢失此次已提交的修改。这是对事务持久性的破坏。

### 日志的种类和格式

- ``:描述一次数据库写操作,T 是执行写操作的事务的唯一标识,X 是要写的数据项,V1 是数据项的旧值,V2 是数据项的新值。
- ``:对数据库写操作的撤销操作,将事务 T 的 X 数据项恢复为旧值 V1。在事务恢复阶段插入。
- ``: 事务 T 开始
- ``: 事务 T 提交
- ``: 事务 T 中止

关于日志,有以下两条规则

- 1.系统在对数据库进行修改前会在日志文件末尾追加相应的日志记录。
- 2.当一个事务的 commit 日志记录写入到磁盘成功后,称这个事务已提交,但事务所做的修改可能并未写入磁盘

### 日志恢复的核心思想

- 撤销事务 undo:将事务更新的所有数据项恢复为日志中的旧值,事务撤销完毕时将插入一条``记录。
- 重做事务 redo:将事务更新的所有数据项恢复为日志中的新值。

事务正常回滚/因事务故障中止将进行 redo
系统从崩溃中恢复时将先进行 redo 再进行 undo。

以下事务将进行 undo:日志中只包括`记录,但既不包括`记录也不包括``记录.

以下事务将进行 redo:日志中包括`记录,也包括`记录或``记录。

假设系统从崩溃中恢复时日志记录如下

```text
<T0 start>
<T0,A,1000,950>
<T0,B,2000,2050>
<T0 commit>
<T1 start>
<T1,C,700,600>

```

由于 T0 既有 start 记录又有 commit 记录,将会对事务 T0 进行重做,执行相应的 redo 操作。
由于 T1 只有 start 记录,将会对 T1 进行撤销,执行相应的 undo 操作,撤销完毕将写入一条 abort 记录。

### 事务故障中止/正常回滚的恢复流程

1. 从后往前扫描日志,对于事务 T 的每个形如``的记录,将旧值 V1 写入数据项 X 中。
2. 往日志中写一个特殊的只读记录``,表示将数据项恢复成旧值 V1,
   这是一个只读的补偿记录,不需要根据它进行 undo。
3. 一旦发现了`日志记录,就停止继续扫描,并往日志中写一个` 日志记录。

   ![1422237-20181122103326981-1784817664.png](https://blog-file.hehouhui.cn/1422237-20181122103326981-1784817664.png)

### 系统崩溃时的恢复过程(带检查点)

检查点是形如``的特殊的日志记录,L 是写入检查点记录时还未提交的事务的集合,系统保证在检查点之前已经提交的事务对数据库的修改已经写入磁盘,不需要进行 redo。检查点可以加快恢复的过程。

系统奔溃时的恢复过程分为两个阶段:重做阶段和撤销阶段。

重做阶段:

1. 系统从最后一个检查点开始正向的扫描日志,将要重做的事务的列表 undo-list 设置为检查点日志记录中的 L 列表。
2. 发现`的更新记录或`的补偿撤销记录,就重做该操作。
3. 发现``记录,就把 T 加入到 undo-list 中。
4. 发现`或`记录,就把 T 从 undo-list 中去除。

撤销阶段:

1. 系统从尾部开始反向扫描日志
2. 发现属于 undo-list 中的事务的日志记录,就执行 undo 操作
3. 发现 undo-list 中事务的 T 的`记录,就写入一条`记录,
   并把 T 从 undo-list 中去除。

4.undo-list 为空,则撤销阶段结束

总结:先将日志记录中所有事务的更新按顺序重做一遍,在针对需要撤销的事务按相反的顺序执行其更新操作的撤销操作。

### 总结

事务是数据库系统进行并发控制的基本单位,是数据库系统进行故障恢复的基本单位,从而也是保持数据库状态一致性的基本单位。ACID 是事务的基本特性,数据库系统是通过并发控制技术和日志恢复技术来对事务的 ACID 进行保证的,从而可以得到如下的关于数据库事务的概念体系结构。

![1422237-20181122103402725-726722235.png](https://blog-file.hehouhui.cn/1422237-20181122103402725-726722235.png)

## 故障与故障恢复技术

数据库运行过程中可能会出现故障,这些故障包括事务故障和系统故障两大类

- 事务故障:比如非法输入,系统出现死锁,导致事务无法继续执行。
- 系统故障:比如由于软件漏洞或硬件错误导致系统崩溃或中止。

这些故障可能会对事务和数据库状态造成破坏,因而必须提供一种技术来对各种故障进行恢复,保证数据库一致性,事务的原子性以及持久性。数据库通常以日志的方式记录数据库的操作从而在故障时进行恢复,因而可以称之为日志恢复技术。

## [锁机制与 InnoDB 锁算法](https://snailclimb.gitee.io/javaguide/#/docs/database/MySQL?id=%E9%94%81%E6%9C%BA%E5%88%B6%E4%B8%8Einnodb%E9%94%81%E7%AE%97%E6%B3%95)

**MyISAM 和 InnoDB 存储引擎使用的锁：**

- MyISAM 采用表级锁(table-level locking)。
- InnoDB 支持行级锁(row-level locking)和表级锁,默认为行级锁

**表级锁和行级锁对比：**

- **表级锁：** MySQL 中锁定 **粒度最大** 的一种锁，对当前操作的整张表加锁，实现简单，资源消耗也比较少，加锁快，不会出现死锁。其锁定粒度最大，触发锁冲突的概率最高，并发度最低，MyISAM 和 InnoDB 引擎都支持表级锁。
- **行级锁：** MySQL 中锁定 **粒度最小** 的一种锁，只针对当前操作的行进行加锁。 行级锁能大大减少数据库操作的冲突。其加锁粒度最小，并发度高，但加锁的开销也最大，加锁慢，会出现死锁。

详细内容可以参考： MySQL 锁机制简单了解一下：[https://blog.csdn.net/qq_34337272/article/details/80611486](https://blog.csdn.net/qq_34337272/article/details/80611486)

### 行锁

    A recordlockisalockonanindexrecord.Recordlocksalwayslockindexrecords, evenifatableisdefinedwithnoindexes.Forsuch cases,InnoDBcreates a hidden clusteredindexanduses thisindexforrecordlocking.

上文出自 MySQL 的官方文档，从这里我们可以看出行锁是作用在索引上的，哪怕你在建表的时候没有定义一个索引，InnoDB 也会创建一个聚簇索引并将其作为锁作用的索引。

这里还是讲一下 InnoDB 中的聚簇索引。每一个 InnoDB 表都需要一个聚簇索引，有且只有一个。如果你为该表表定义一个主键，那么 MySQL 将使用主键作为聚簇索引；如果你不为定义一个主键，那么 MySQL 将会把第一个唯一索引(而且要求 NOT NULL)作为聚簇索引；如果上诉两种情况都 GG，那么 MySQL 将自动创建一个名字为 的隐藏聚簇索引。

因为是聚簇索引，所以 B+树上的叶子节点都存储了数据行，那么如果现在是二级索引呢？InnoDB 中的二级索引的叶节点存储的是主键值(或者说聚簇索引的值)，所以通过二级索引查询数据时，还需要将对应的主键去聚簇索引中再次进行查询。

关于索引的问题就到这，我们用一张直观的图来表示行锁：

![63ebdaf075f09b127f9ca322af07fcab.png](https://img-blog.csdnimg.cn/img_convert/63ebdaf075f09b127f9ca322af07fcab.png)

接下来以两条 SQL 的执行为例，讲解一下 InnoDB 对于单行数据的加锁原理：

updateusersetage =10whereid=49;

updateusersetage =10wherename='Tom';

第一条 SQL 使用主键查询，只需要在 id = 49 这个主键索引上加上锁。第二条 SQL 使用二级索引来查询，那么首先在 name = Tom 这个索引上加写锁，然后由于使用 InnoDB 二级索引还需再次根据主键索引查询，所以还需要在 id = 49 这个主键索引上加锁。

也就是说使用主键索引需要加一把锁，使用二级索引需要在二级索引和主键索引上各加一把锁。

根据索引对单行数据进行更新的加锁原理了解了，那如果更新操作涉及多个行呢，比如下面 SQL 的执行场景。

updateusersetage =10whereid>49;

上述 SQL 的执行过程如下图所示。MySQL Server 会根据 WHERE 条件读取第一条满足条件的记录，然后 InnoDB 引擎会将第一条记录返回并加锁，接着 MySQL Server 发起更新改行记录的 UPDATE 请求，更新这条记录。一条记录操作完成，再读取下一条记录，直至没有匹配的记录为止。

![39bea16e38602978f21fb5f6f50e92d4.png](https://img-blog.csdnimg.cn/img_convert/39bea16e38602978f21fb5f6f50e92d4.png)

**InnoDB 存储引擎的锁的算法有三种：**

- Record lock：单个行记录上的锁
- Gap lock：间隙锁，锁定一个范围，不包括记录本身
- Next-key lock：record+gap 锁定一个范围，包含记录本身

**相关知识点：**

1. innodb 对于行的查询使用 next-key lock
2. Next-locking keying 为了解决 Phantom Problem 幻读问题
3. 当查询的索引含有唯一属性时，将 next-key lock 降级为 record key
4. Gap 锁设计的目的是为了阻止多个事务将记录插入到同一范围内，而这会导致幻读问题的产生
5. 有两种方式显式关闭 gap 锁：（除了外键约束和唯一性检查外，其余情况仅使用 record lock） A. 将事务隔离级别设置为 RC B. 将参数 innodb_locks_unsafe_for_binlog 设置为 1

### 表锁

上面我们讲解行锁的时候，操作语句中的条件判断列都是有建立索引的，那么如果现在的判断列不存在索引呢？InnoDB 既支持行锁，也支持表锁，当没有查询列没有索引时，InnoDB 就不会去搞什么行锁了，毕竟行锁一定要有索引，所以它现在搞表锁，把整张表给锁住了。那么具体啥是表锁？还有其他什么情况下也会进行锁表呢？

表锁使用的是一次性锁技术，也就是说，在会话开始的地方使用 lock 命令将后续需要用到的表都加上锁，在表释放前，只能访问这些加锁的表，不能访问其他表，直到最后通过 unlock tables 释放所有表锁。

除了使用 unlock tables 显示释放锁之外，会话持有其他表锁时执行 lock table 语句会释放会话之前持有的锁；会话持有其他表锁时执行 start transaction 或者 begin 开启事务时，也会释放之前持有的锁。

![c0db3b3234e3875aaf94d6add3b14269.png](https://img-blog.csdnimg.cn/img_convert/c0db3b3234e3875aaf94d6add3b14269.png)

表锁由 MySQL Server 实现，行锁则是存储引擎实现，不同的引擎实现的不同。在 MySQL 的常用引擎中 InnoDB 支持行锁，而 MyISAM 则只能使用 MySQL Server 提供的表锁。

## 日志

MySQL 中有以下日志文件，分别是：

1：**重做日志（redo log）**

2：**回滚日志（undo log）**

3：**二进制日志（binlog）**

4：**错误日志（errorlog）**

5：**慢查询日志（slow query log）**

6：**一般查询日志（general log）**

7：**中继日志（relay log）。**

其中重做日志和回滚日志与事务操作息息相关，二进制日志也与事务操作有一定的关系，这三种日志，对理解 MySQL 中的事务操作有着重要的意义。

### 重做日志（redo log）

**作用：**

确保事务的持久性。redo 日志记录事务执行后的状态，用来恢复未写入 data file 的已成功事务更新的数据。防止在发生故障的时间点，尚有脏页未写入磁盘，在重启[mysql](https://www.2cto.com/database/MySQL/)服务的时候，根据 redo log 进行重做，从而达到事务的持久性这一特性。

**内容：**

物理格式的日志，记录的是物理数据页面的修改的信息，其 redo log 是顺序写入 redo log file 的物理文件中去的。

**什么时候产生：**

事务开始之后就产生 redo log，redo log 的落盘并不是随着事务的提交才写入的，而是在事务的执行过程中，便开始写入 redo log 文件中。

**什么时候释放：**

当对应事务的脏页写入到磁盘之后，redo log 的使命也就完成了，重做日志占用的空间就可以重用（被覆盖）。

**对应的物理文件：**

默认情况下，对应的物理文件位于[数据库](https://www.2cto.com/database/)的 data 目录下的 ib_logfile1&ib_logfile2

innodb_log_group_home_dir 指定日志文件组所在的路径，默认./ ，表示在数据库的数据目录下。

innodb_log_files_in_group 指定重做日志文件组中文件的数量，默认 2

**关于文件的大小和数量，由以下两个参数配置：**

innodb_log_file_size 重做日志文件的大小。

innodb_mirrored_log_groups 指定了日志镜像文件组的数量，默认 1

**其他：**

很重要一点，redo log 是什么时候写盘的？前面说了是在事物开始之后逐步写盘的。

之所以说重做日志是在事务开始之后逐步写入重做日志文件，而不一定是事务提交才写入重做日志缓存，原因就是，重做日志有一个缓存区 Innodb_log_buffer，Innodb_log_buffer 的默认大小为 8M(这里设置的 16M),Innodb 存储引擎先将重做日志写入 innodb_log_buffer 中。

![20180313092754205.png](https://www.2cto.com/uploadfile/Collfiles/20180313/20180313092754205.png)

然后会通过以下三种方式将 innodb 日志缓冲区的日志刷新到磁盘

Master Thread 每秒一次执行刷新 Innodb_log_buffer 到重做日志文件。

每个事务提交时会将重做日志刷新到重做日志文件。

当重做日志缓存可用空间 少于一半时，重做日志缓存被刷新到重做日志文件

由此可以看出，重做日志通过不止一种方式写入到磁盘，尤其是对于第一种方式，Innodb_log_buffer 到重做日志文件是 Master Thread 线程的定时任务。

因此重做日志的写盘，并不一定是随着事务的提交才写入重做日志文件的，而是随着事务的开始，逐步开始的。

另外引用《MySQL 技术内幕 Innodb 存储引擎》（page37）上的原话：

即使某个事务还没有提交，Innodb 存储引擎仍然每秒会将重做日志缓存刷新到重做日志文件。

这一点是必须要知道的，因为这可以很好地解释再大的事务的提交（commit）的时间也是很短暂的。

### 回滚日志（undo log）

**作用：**

保证数据的原子性，保存了事务发生之前的数据的一个版本，可以用于回滚，同时可以提供多版本并发控制下的读（MVCC），也即非锁定读

**内容：**

逻辑格式的日志，在执行 undo 的时候，仅仅是将数据从逻辑上恢复至事务之前的状态，而不是从物理页面上操作实现的，这一点是不同于 redo log 的。

**什么时候产生：**

事务开始之前，将当前是的版本生成 undo log，undo 也会产生 redo 来保证 undo log 的可靠性

**什么时候释放：**

当事务提交之后，undo log 并不能立马被删除，而是放入待清理的链表，由 purge 线程判断是否由其他事务在使用 undo 段中表的上一个事务之前的版本信息，决定是否可以清理 undo log 的日志空间。

**对应的物理文件：**

MySQL5.6 之前，undo 表空间位于共享表空间的回滚段中，共享表空间的默认的名称是 ibdata，位于数据文件目录中。

MySQL5.6 之后，undo 表空间可以配置成独立的文件，但是提前需要在配置文件中配置，完成数据库初始化后生效且不可改变 undo log 文件的个数

如果初始化数据库之前没有进行相关配置，那么就无法配置成独立的表空间了。

**关于 MySQL5.7 之后的独立 undo 表空间配置参数如下：**

innodb_undo_directory = /data/un[dos](https://www.2cto.com/os/dos/)pace/ –undo 独立表空间的存放目录 innodb_undo_logs = 128 –回滚段为 128KB innodb_undo_tablespaces = 4 –指定有 4 个 undo log 文件

如果 undo 使用的共享表空间，这个共享表空间中又不仅仅是存储了 undo 的信息，共享表空间的默认为与 MySQL 的数据目录下面，其属性由参数 innodb_data_file_path 配置。

![20180313092754206.png](https://www.2cto.com/uploadfile/Collfiles/20180313/20180313092754206.png)

**其他：**

undo 是在事务开始之前保存的被修改数据的一个版本，产生 undo 日志的时候，同样会伴随类似于保护事务持久化机制的 redolog 的产生。

默认情况下 undo 文件是保持在共享表空间的，也即 ibdatafile 文件中，当数据库中发生一些大的事务性操作的时候，要生成大量的 undo 信息，全部保存在共享表空间中的。

因此共享表空间可能会变的很大，默认情况下，也就是 undo 日志使用共享表空间的时候，被“撑大”的共享表空间是不会也不能自动收缩的。

因此，mysql5.7 之后的“独立 undo 表空间”的配置就显得很有必要了。

### 二进制日志（binlog）

**作用：**

用于复制，在主从复制中，从库利用主库上的 binlog 进行重播，实现主从同步。

用于数据库的基于时间点的还原。

**内容：**

逻辑格式的日志，可以简单认为就是执行过的事务中的 sql 语句。

但又不完全是 sql 语句这么简单，而是包括了执行的 sql 语句（增删改）反向的信息，也就意味着 delete 对应着 delete 本身和其反向的 insert；update 对应着 update 执行前后的版本的信息；insert 对应着 delete 和 insert 本身的信息。

在使用 mysqlbinlog 解析 binlog 之后一些都会真相大白。

因此可以基于 binlog 做到类似于 oracle 的闪回功能，其实都是依赖于 binlog 中的日志记录。

**什么时候产生：**

事务提交的时候，一次性将事务中的 sql 语句（一个事物可能对应多个 sql 语句）按照一定的格式记录到 binlog 中。

这里与 redo log 很明显的差异就是 redo log 并不一定是在事务提交的时候刷新到磁盘，redo log 是在事务开始之后就开始逐步写入磁盘。

因此对于事务的提交，即便是较大的事务，提交（commit）都是很快的，但是在开启了 bin_log 的情况下，对于较大事务的提交，可能会变得比较慢一些。

这是因为 binlog 是在事务提交的时候一次性写入的造成的，这些可以通过测试验证。

**什么时候释放：**

binlog 的默认是保持时间由参数 expire_logs_days 配置，也就是说对于非活动的日志文件，在生成时间超过 expire_logs_days 配置的天数之后，会被自动删除。

![20180313092754207.png](https://www.2cto.com/uploadfile/Collfiles/20180313/20180313092754207.png)

**对应的物理文件：**

配置文件的路径为 log_bin_basename，binlog 日志文件按照指定大小，当日志文件达到指定的最大的大小之后，进行滚动更新，生成新的日志文件。

对于每个 binlog 日志文件，通过一个统一的 index 文件来组织。

![20180313092754208.png](https://www.2cto.com/uploadfile/Collfiles/20180313/20180313092754208.png)

**其他：**

二进制日志的作用之一是还原数据库的，这与 redo log 很类似，很多人混淆过，但是两者有本质的不同

**作用不同**：redo log 是保证事务的持久性的，是事务层面的，binlog 作为还原的功能，是数据库层面的（当然也可以精确到事务层面的），虽然都有还原的意思，但是其保护数据的层次是不一样的。

**内容不同**：redo log 是物理日志，是数据页面的修改之后的物理记录，binlog 是逻辑日志，可以简单认为记录的就是 sql 语句

另外，两者日志产生的时间，可以释放的时间，在可释放的情况下清理机制，都是完全不同的。

恢复数据时候的效率，基于物理日志的 redo log 恢复数据的效率要高于语句逻辑日志的 binlog

关于事务提交时，redo log 和 binlog 的写入顺序，为了保证主从复制时候的主从一致（当然也包括使用 binlog 进行基于时间点还原的情况），是要严格一致的，MySQL 通过两阶段提交过程来完成事务的一致性的，也即 redo log 和 binlog 的一致性的，理论上是先写 redo log，再写 binlog，两个日志都提交成功（刷入磁盘），事务才算真正的完成。

### **错误日志**

错误日志记录着 mysqld 启动和停止,以及服务器在运行过程中发生的错误的相关信息。在默认情况下，系统记录错误日志的功能是关闭的，错误信息被输出到标准错误输出。
　　指定日志路径两种方法:
　　　　编辑 my.cnf 写入 log-error=[path]
　　　　通过命令参数错误日志 mysqld_safe –user=mysql –log-error=[path] &

显示错误日志的命令（如下图所示）

![885859-20190418111428261-484993255.png](https://img2018.cnblogs.com/blog/885859/201904/885859-20190418111428261-484993255.png)

### **普通查询日志**

记录了服务器接收到的每一个查询或是命令，无论这些查询或是命令是否正确甚至是否包含语法错误，general log 都会将其记录下来 ，记录的格式为 {Time ，Id ，Command，Argument }。也正因为 mysql 服务器需要不断地记录日志，开启 General log 会产生不小的系统开销。 因此，Mysql 默认是把 General log 关闭的。

查看日志的存放方式：show variables like ‘log_output’;

![885859-20190418111501042-772781517.png](https://blog-file.hehouhui.cn/885859-20190418111501042-772781517.png)

如果设置 mysql> set global log_output=’table’ 的话，则日志结果会记录到名为 gengera_log 的表中，这表的默认引擎都是 CSV
　　如果设置表数据到文件 set global log_output=file;
　　设置 general log 的日志文件路径：
　　　　 set global general_log_file=’/tmp/general.log’;
　　　　开启 general log： set global general_log=on;
　　　　关闭 general log： set global general_log=off;

![885859-20190418111501042-772781517-1645409187723.png](https://blog-file.hehouhui.cn/885859-20190418111501042-772781517-1645409187723.png)

然后在用：show global variables like ‘general_log’

![885859-20190418111551171-1738333923.png](https://blog-file.hehouhui.cn/885859-20190418111551171-1738333923.png)

### 慢查询日志

慢日志记录执行时间过长和没有使用索引的查询语句，报错 select、update、delete 以及 insert 语句，慢日志只会记录执行成功的语句。
　　 1. 查看慢查询时间：
　　 show variables like “long_query_time”;默认 10s

![image](9)

2. 查看慢查询配置情况：
   　　 show status like “%slow_queries%”;

![885859-20190418111656450-521011638.png](https://blog-file.hehouhui.cn/885859-20190418111656450-521011638.png)

3. 查看慢查询日志路径：
   　　 show variables like “%slow%”;

![885859-20190418111712973-766266117.png](https://blog-file.hehouhui.cn/885859-20190418111712973-766266117.png)

4. 开启慢日志

![885859-20190418111737882-1420825238.png](https://blog-file.hehouhui.cn/885859-20190418111737882-1420825238.png)

查看已经开启：

![885859-20190418111753391-1884429309.png](https://blog-file.hehouhui.cn/885859-20190418111753391-1884429309.png)

## 优化

### 大表优化

> 当 MySQL 单表记录数过大时，数据库的 CRUD 性能会明显下降，一些常见的优化措施如下：

### [1. 限定数据的范围](https://snailclimb.gitee.io/javaguide/#/docs/database/MySQL?id=_1-%E9%99%90%E5%AE%9A%E6%95%B0%E6%8D%AE%E7%9A%84%E8%8C%83%E5%9B%B4)

务必禁止不带任何限制数据范围条件的查询语句。比如：我们当用户在查询订单历史的时候，我们可以控制在一个月的范围内；

### [2. 读/写分离](https://snailclimb.gitee.io/javaguide/#/docs/database/MySQL?id=_2-%E8%AF%BB%E5%86%99%E5%88%86%E7%A6%BB)

经典的数据库拆分方案，主库负责写，从库负责读；

### [3. 垂直分区](https://snailclimb.gitee.io/javaguide/#/docs/database/MySQL?id=_3-%E5%9E%82%E7%9B%B4%E5%88%86%E5%8C%BA)

**根据数据库里面数据表的相关性进行拆分。** 例如，用户表中既有用户的登录信息又有用户的基本信息，可以将用户表拆分成两个单独的表，甚至放到单独的库做分库。

**简单来说垂直拆分是指数据表列的拆分，把一张列比较多的表拆分为多张表。**

如下图所示，这样来说大家应该就更容易理解了。

![%E6%95%B0%E6%8D%AE%E5%BA%93%E5%9E%82%E7%9B%B4%E5%88%86%E5%8C%BA.png](https://my-blog-to-use.oss-cn-beijing.aliyuncs.com/2019-6/%E6%95%B0%E6%8D%AE%E5%BA%93%E5%9E%82%E7%9B%B4%E5%88%86%E5%8C%BA.png)

- **垂直拆分的优点：** 可以使得列数据变小，在查询时减少读取的 Block 数，减少 I/O 次数。此外，垂直分区可以简化表的结构，易于维护。
- **垂直拆分的缺点：** 主键会出现冗余，需要管理冗余列，并会引起 Join 操作，可以通过在应用层进行 Join 来解决。此外，垂直分区会让事务变得更加复杂；

### [4. 水平分区](https://snailclimb.gitee.io/javaguide/#/docs/database/MySQL?id=_4-%E6%B0%B4%E5%B9%B3%E5%88%86%E5%8C%BA)

**保持数据表结构不变，通过某种策略存储数据分片。这样每一片数据分散到不同的表或者库中，达到了分布式的目的。 水平拆分可以支撑非常大的数据量。**

水平拆分是指数据表行的拆分，表的行数超过 200 万行时，就会变慢，这时可以把一张的表的数据拆成多张表来存放。举个例子：我们可以将用户信息表拆分成多个用户信息表，这样就可以避免单一表数据量过大对性能造成影响。

![20220221101205.png](https://blog-file.hehouhui.cn/20220221101205.png)

水平拆分可以支持非常大的数据量。需要注意的一点是：分表仅仅是解决了单一表数据过大的问题，但由于表的数据还是在同一台机器上，其实对于提升 MySQL 并发能力没有什么意义，所以 **水平拆分最好分库** 。

水平拆分能够 **支持非常大的数据量存储，应用端改造也少**，但 **分片事务难以解决** ，跨节点 Join 性能较差，逻辑复杂。《Java 工程师修炼之道》的作者推荐 **尽量不要对数据进行分片，因为拆分会带来逻辑、部署、运维的各种复杂度** ，一般的数据表在优化得当的情况下支撑千万以下的数据量是没有太大问题的。如果实在要分片，尽量选择客户端分片架构，这样可以减少一次和中间件的网络 I/O。

**补充一下数据库分片的两种常见方案：**

- **客户端代理：** **分片逻辑在应用端，封装在 jar 包中，通过修改或者封装 JDBC 层来实现。** 当当网的 **Sharding-JDBC** 、阿里的 TDDL 是两种比较常用的实现。
- **中间件代理：** **在应用和数据中间加了一个代理层。分片逻辑统一维护在中间件服务中。** 我们现在谈的 **Mycat** 、360 的 Atlas、网易的 DDB 等等都是这种架构的实现。
