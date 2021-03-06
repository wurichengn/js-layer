## JS-Layer 程序化的图像处理工具

### 目前这个工具还在构思阶段

计划开发一款前端的图像处理工具，能够比较简单的扩展部分功能，并且使用起来比较灵活。目标期望这个工具拥有以下特性：

 - `程序化` 这个工具的渲染部分的输入完全由一个结构化数据决定（目前是`json`），保留处理流程中的每一步细节，这样将降低渲染效率、占用更多内存而且将失去设计的灵活性，但是可以使得处理流程中的每一步都是动态可调整的。

 - `扩展性` 基本功能简单，但绝大多部分均容易扩展。至少具备灵活定义效果器、滤镜、生成器的功能。最好可以扩展插件、渲染结构等部分。

 - `复用性` 所有的图像处理流程设计完成后可以将部分内容设计为变量，这部分内容将可以通过外部简单修改变量来进行批量的图像处理。

 - `纯前端` 所有渲染类功能均完全由前端实现，处理均运行在客户端。


### 各个模块的预期

计划将内容划分为不同的模块进行开发

#### 图像渲染
 - 通过`JSON`的输入，输出一张静态图
 - 通过guid可以同步到每个层级的各种内容渲染时的反馈
 - 连续的渲染只重渲染参数改变过的结构树
 - 在该结构中不同的效果或者应用有固定的执行顺序和分离的定义

#### 结构化出图
 - 依赖于`图像渲染`
 - 通过`JSON`的输入，输出一套更复杂的图形或动画，实际为构造多次`图像渲染`结构的数据并进行渲染组合
 - 模糊化效果器的边界，根据效果器的功能来自动拆分各个细节部分和功能
 - 对于各种内容，支持参数的补间效果
 - 支持数据级别效果器，如克隆这类效果器（实际实现为在调用图像渲染阶段前修改JSON结构）

#### 编辑器UI
 - 依赖于`结构化出图`
 - 使用与`结构化出图`相同的数据结构，在可视化的界面中完成编辑时需要的各种操作