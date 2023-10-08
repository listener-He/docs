# wkhtmltopdf

> “wkhtmltopdf"，是一个能够把网页/文件转换成 PDF 的工具。工具全名叫 "wkhtmltopdf" ; 是一个使用 Qt WebKit 引擎做渲染的，能够把 html 文档转换成 pdf 文档 或 图片(image) 的**“命令行工具”**。

    支持多个平台，可在win，linux，os x 等系统下运行。

## 安装

        通过文章底部的下载连接选择适合的版本**注意系统版本** 此处按照liunx版本来讲解


       liunx版本的安装相对比较简单直接解压即可 解压后目录为use，重命名为wkhtmltopdf（强迫症）。 目录结构

`/wkhtmltopdf/local/bin/`

![](https://blog-file.hehouhui.cn/202203152219619.png)

- wkhtmltopdf 把一个文件或网页转成 pdf
- wkhtmltoimage 把一个文件或网页转成图片

> 妥妥的见名知意

## 使用

### 把一个 html 文件转换成 PDF

命令格式 ：`wkhtmltopdf xxx.html xxx.pdf`

```text
wkhtmltopdf 1.html 1.pdf
Loading pages (1/6)
Counting pages (2/6)
Resolving links (4/6)
Loading headers and footers (5/6)
Printing pages (6/6)
Done

```

当你看到类似上面的内容时，说转换已经完成了，去打开转换好的 pdf 文档慢慢研究吧。

### 把一个 url 指向的网页转换成 PDF

命令格式 ： `wkhtmltopdf url xxx.pdf`

```text
wkhtmltopdf www.yioks.com yioks.pdf
Loading pages (1/6)
QFont::setPixelSize: Pixel size <= 0 (0)                     ] 55%
Counting pages (2/6)
QFont::setPixelSize: Pixel size <= 0 (0)=====================] Object 1 of 1
Resolving links (4/6)
Loading headers and footers (5/6)
Printing pages (6/6)
Done

```

当你看到如上信息时代表转换成功，是不是很酷。

### 把 html 文件 和 url 指向的网页 转换成图片

命令格式 ：

```text
wkhtmltoimage xxx.html xxx.jpg
wkhtmltoimage url xxx.jpg

```

其实和转 pdf 时的参数是一样的，只是命令和输出文件的扩展名变了。上的命令格式中，我是把图片保存成了 jpg 格式，当然，如果你愿意也可以保存成其他图片格式(如：png)，但文件可能会变大很多倍。在我的测试中，jpg 格式文件是最小的。

## 使用过程中的问题

- liunx 环境下中文乱码
- 部分 liunx 服务器缺少依赖 lib
- \*中文乱码 \*\*

liunx 中缺少中文（宋体）字体文件，

([下载字体文件](https://blog-file.hehouhui.cn/202203152226460.zip))

放置服务器中 `/usr/share/fonts`目录下

![](https://blog-file.hehouhui.cn/202203152228291.png)

**缺少 lib**

libjpeg.so.62 的解决方案

![](https://blog-file.hehouhui.cn/202203152229619.png)

执行如下命令下载依赖

`yum install fontconfig freetype libpng libjpeg libX11 libXext libXrender xorg-x11-fonts-Type1 xorg-x11-fonts-75dpi`

## 其他的 html 转 pdf 方案

- itextpdf.html2pdf 可转换样式简单的 html 使用简单速度快，对 CSS 样式支持不是很好。在 contract 中的实现为 **PdfGeneratorIText**
- lowagie.itext 可转换较复杂的 html，但对格式极其严苛。速度快

> 也有其他几款转换工具但都有或多或少的缺陷，wkhtmltopdf 虽说慢至少样式还行

## 下载链接

[【官网】](http://wkhtmltopdf.org/):[【](http://wkhtmltopdf.org/)[http://wkhtmltopdf.org/】](http://wkhtmltopdf.org/%E3%80%91)

[【下载列表】](http://wkhtmltopdf.org/downloads.html)

([详细使用](https://blog.hehouhui.cn/archives/39))
