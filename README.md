## JS-Layer 程序化的图像处理工具

#### 目前这个工具还在构思阶段

计划开发一款前端的图像处理工具，能够比较简单的扩展部分功能，并且使用起来比较灵活。目标期望这个工具拥有以下特性：

 - `程序化` 这个工具的渲染部分的输入完全由一个结构化数据决定（目前是`json`），保留处理流程中的每一步细节，这样将降低渲染效率、占用更多内存而且将失去设计的灵活性，但是可以使得处理流程中的每一步都是动态可调整的。

 - `扩展性` 基本功能简单，但绝大多部分均容易扩展。至少具备灵活定义效果器、滤镜、生成器的功能。最好可以扩展插件、渲染结构等部分。

 - `复用性` 所有的图像处理流程设计完成后可以将部分内容设计为变量，这部分内容将可以通过外部简单修改变量来进行批量的图像处理。

 - `纯前端` 所有渲染类功能均完全由前端实现，处理均运行在客户端。