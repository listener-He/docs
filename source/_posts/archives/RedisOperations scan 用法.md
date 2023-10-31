---
password: ''
icon: ''
date: '2020-07-23'
type: Post
category: 技术分享
urlname: '9'
catalog:
  - archives
tags:
  - Spring
  - Java
  - Redis
summary: >-
  记录一次scan和keys的使用,scan和key都是redis搜索key的值函数,但实现却完全不同。生产环境用key的同学准备好跑路吧~keysWarning:
  consider KEYS as a
sort: ''
title: RedisOperations scan 用法
status: Published
updated: '2023-10-08 14:42:00'
abbrlink: 35150
---

> 记录一次 scan 和 keys 的使用,scan 和 key 都是 redis 搜索 key 的值函数,但实现却完全不同。生产环境用 key 的同学准备好跑路吧~

# keys

> Warning: consider KEYS as a command that should only be used in production environments with extreme care. It may ruin performance when it is executed against large databases. This command is intended for debugging and special operations, such as changing your keyspace layout. Don't use KEYS in your regular application code. If you're looking for a way to find keys in a subset of your keyspace, consider using sets.

> 上面是官方文档声明，KEYS 命令不能用在生产的环境中，这个时候如果数量过大效率是十分低的。

```text
       /**
	 * Find all keys matching the given {@code pattern}.
	 *
	 * @param pattern must not be {@literal null}.
	 * @return {@literal null} when used in pipeline / transaction.
	 * @see <a href="<https://redis.io/commands/keys>">Redis Documentation: KEYS</a>
	 */
	@Nullable
	Set<K> keys(K pattern);


```

> keys 函数支持传入一个正则字符串，遍历 redis 中所有匹配到的 key。命令会引起阻塞,性能随着数据库数据的增多而越来越慢。

# SCAN

> Redis 从 2.8 版本开始支持 scan 命令，SCAN 命令的基本用法如下

1. 复杂度虽然也是 O(n)，通过游标分步进行不会阻塞线程;
2. 有限制参数 COUNT ；
3. 同 keys 命令 一样提供模式匹配功能;
4. 服务器不需要为游标保存状态，游标的唯一状态就是 scan 返回给客户端的游标整数;

> 但是需要注意返回结果可能重复，需要客户端去重。如果遍历过程中有数据修改，改动后的数据不保证同步。

_scan 命令提供三个参数，第一个是 cursor，第二个是要匹配的正则，第三个是单次遍历的槽位_

## RedisOperations sacn

> spring 中 redisOperations 只有 HashOperations 类提供 scan 方法

```text
      /**
	 * Use a {@link Cursor} to iterate over entries in hash at {@code key}. <br />
	 * <strong>Important:</strong> Call {@link Cursor#close()} when done to avoid resource leak.
	 *
	 * @param key must not be {@literal null}.
	 * @param options
	 * @return {@literal null} when used in pipeline / transaction.
	 * @since 1.4
	 */
	Cursor<Map.Entry<HK, HV>> scan(H key, ScanOptions options);

```

## 使用

```text
       /**
         *  搜索
         */
        Cursor<Map.Entry<ID, Double>> cursor = hash.scan(key,new ScanOptions.ScanOptionsBuilder().match(sb.toString()).count(keys.size()).build());

        Map<ID, Double> map = new HashMap<>(keys.size());
        while (cursor.hasNext()) {
            Map.Entry<ID, Double> next = cursor.next();
            map.put(next.getKey(), next.getValue());
        }

```

> 第一个遍历是 cursor 值为 0，然后将返回结果的第一个整数作为下一个遍历的游标，如果最后返回的到 cursor 的值为 0 就代表结束。
