#

SILK v3 编码是 Skype 向第三方开发人员和硬件制造商提供免版税认证(RF)的 Silk 宽带音频编码器，Skype 后来将其开源。具体可见 Wikipedia。

> 之前一直使用 ffmpeg 来进行格式转换，但是将微信的 amr 转为 mp3 后语音质量不理想（也可能是我参数没有调正确 🤪）。  
> 于是就继续想解决办法，后来在 github 瞎逛时看到可以使用 silk-v3-decoder 来做这件事情。虽然本质上还是使用的 ffmpeg 来转的，只是封装了一下。

([前往 silk-v3-decoder](https://github.com/kn007/silk-v3-decoder))

++环境要求 gcc 和 ffmpeg，所以还是得要安装 ffmpeg，gcc 是拿来编译 silk-v3-decoder 源码，ffmpeg 是拿来转换格式的。++

## 安装 gcc

```text
yum -y install gcc
yum -y install gcc-c++

```

## ffmpeg 安装

打开官网地址，进入下载页：[https://ffmpeg.org/download.html#build-linux](https://ffmpeg.org/download.html#build-linux)

![](https://blog-file.hehouhui.cn/202203172321911.png)

选择 Linux Static Builds 下的构建选项，进入详情页

![](https://blog-file.hehouhui.cn/202203172323866.png)

在列表中选择适合自己的版本，鼠标右键，复制链接地址

```text
# 下载文件
wget <https://johnvansickle.com/ffmpeg/builds/ffmpeg-git-amd64-static.tar.xz>

# 解压
xz -d ffmpeg-git-amd64-static.tar.xz

# 再次解压
tar -xvf ffmpeg-git-amd64-static.tar


```

得到目录

![](https://blog-file.hehouhui.cn/202203172329558.png)

ffmpeg 和 ffprobe 都在这里

> 如果想要 ffmpeg 命令全局可用，可以在 bin 目录加个链接。比如，分别执行如下命令，即可在:/usr/bin 目录下创建 ffmpeg 和 ffprobe 软链接。

```text
cd /usr/bin
ln -s 解压目录/ffmpeg ffmpeg
ln -s 解压目录/ffprobe ffprobe

```

## 下载 silk-v3-decoder 源码

```text
  <https://ghproxy.com/https://github.com/kn007/silk-v3-decoder/archive/refs/heads/master.zip>

```

![](https://blog-file.hehouhui.cn/202203172333398.png)

给脚步赋执行权限

```text
   chmod +x converter.sh
   chmod +x converter_beta.sh

```

## 使用

```text
   silk-v3-decoder目录/converter.sh silk音频文件路径 mp3

```

> 第一个为执行脚本 第二个为 silk 音频如 amr 文件路径 第三个为需要转换为的音频格式
