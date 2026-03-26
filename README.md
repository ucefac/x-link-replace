# x-link-replace

一个 Chrome 浏览器扩展，用于替换 Twitter/X 的 t.co 短链接为真实 URL，并提供全网链接悬停预览功能。

## 功能

### 1. t.co 链接替换

Twitter/X 会将所有外部链接重写为 `t.co` 短链接。此扩展通过从链接的 `<span>` 子元素中提取并拼接真实 URL，直接替换 `href` 属性，让你可以看到并跳转到真实链接。

### 示例

**替换前：**
```html
<a href="https://t.co/xxxx">
    <span>https://</span>
    <span>xxx</span>
    <span>…</span>
</a>
```

**替换后：**
```html
<a href="https://xxx">
    <!-- 内容不变 -->
</a>
```

### 2. 链接悬停预览（全网）

在任意网站上，鼠标悬停在链接上时，会以原生 tooltip 形式显示完整的 URL 地址，方便快速预览链接目标。

### 3. 可配置设置

点击扩展图标打开设置面板，可以自定义：
- **链接悬停预览**：是否在所有网站显示链接 URL 悬停提示（默认开启）
- **t.co 链接替换**：是否在 Twitter/X 上替换短链接（默认开启）

### 示例

**替换前：**
```html
<a href="https://t.co/xxxx">
    <span>https://</span>
    <span>xxx</span>
    <span>…</span>
</a>
```

**替换后：**
```html
<a href="https://xxx">
    <!-- 内容不变 -->
</a>
```

## 安装

### 开发者模式安装（推荐）

1. 打开 Chrome 浏览器，访问 `chrome://extensions/`
2. 开启右上角的 **"开发者模式"** 开关
3. 点击 **"加载已解压的扩展程序"** 按钮
4. 选择 `x-link-replace` 文件夹
5. 扩展将出现在已安装扩展列表中

### 手动安装

1. 下载此扩展文件夹
2. 按照上述步骤加载到 Chrome

## 使用方法

### t.co 链接替换

安装后，扩展会自动在以下网站生效：
- `https://twitter.com/*`
- `https://x.com/*`

无需任何操作，扩展会自动处理页面上的 t.co 链接。

### 链接悬停预览

默认为所有网站启用。鼠标悬停在任意链接上即可看到完整 URL 提示。

### 自定义设置

1. 点击浏览器扩展栏中的 X Link Replace 图标
2. 在弹出的设置面板中切换以下选项：
   - **Show link URL tooltip on hover** - 链接悬停预览
   - **Replace t.co links on Twitter/X** - t.co 链接替换

## 验证方案

### 1. 加载扩展

- 打开 Chrome 浏览器，访问 `chrome://extensions/`
- 开启右上角的 **"开发者模式"** 开关
- 点击 **"加载已解压的扩展程序"** 按钮
- 选择 `x-link-replace` 文件夹

### 2. t.co 链接替换测试

- 打开 `https://twitter.com/` 或 `https://x.com/`
- 找到包含外部链接的推文
- 鼠标悬停在链接上，查看浏览器状态栏显示的 URL
- 如果显示的是真实链接（如 `xxx.com/...`），说明扩展正在工作
- 向下滚动加载更多推文，验证新加载的链接也被正确处理

### 3. 链接悬停预览测试

- 打开任意网站（如 `google.com`）
- 鼠标悬停在任意链接上
- 应该会看到浏览器显示的完整 URL 提示

### 4. 设置面板测试

- 点击浏览器工具栏中的 X Link Replace 扩展图标
- 验证设置面板正常显示
- 尝试切换两个开关选项

### 5. Console 检查

- 按 F12 打开开发者工具
- 切换到 Console 标签
- 查看是否有 `[x-link-replace]` 日志
- 确认没有脚本错误

## 技术细节

### 工作原理

1. **Content Script 注入**：扩展通过 Manifest V3 的 `content_scripts` 注入到 Twitter/X 页面
2. **提取真实 URL**：遍历所有 `t.co` 链接，提取子 `<span>` 元素的文本内容并拼接
3. **过滤省略号**：自动移除末尾的省略号（`…` 或 `...`）
4. **URL 验证**：确保拼接后的 URL 格式有效
5. **动态监听**：使用 `MutationObserver` 监听 SPA 页面动态加载的内容

### 文件结构

```
x-link-replace/
├── manifest.json              # Manifest V3 配置
├── content-script.js          # t.co 链接替换核心逻辑
├── content-scripts/
│   └── tooltip.js             # 链接悬停预览功能
├── popup/
│   ├── popup.html             # 设置面板 UI
│   ├── popup.css              # 设置面板样式
│   └── popup.js               # 设置面板逻辑
├── icons/
│   ├── icon16.png             # 扩展图标
│   ├── icon48.png
│   └── icon128.png
└── README.md                  # 此文件
```

## 安全和隐私

### 权限最小化

此扩展遵循最小权限原则：

- **无网络权限**：扩展仅在本地修改 DOM，不发送任何数据到服务器
- **最小存储权限**：仅使用 `storage` 权限保存用户设置（开关状态）
- **仅限必要域名**：t.co 替换功能仅在 `twitter.com` 和 `x.com` 上运行
- **无外部依赖**：所有代码都在本地，不加载任何外部资源

### 数据处理

- **t.co 链接替换**：仅读取链接的 `href` 属性和文本内容，本地拼接并替换
- **链接悬停预览**：仅读取链接的 `href` 属性用于显示 tooltip
- **设置存储**：使用 Chrome storage 保存用户的开关偏好设置
- 不收集、存储或传输任何用户数据到外部服务器
- 所有处理都在本地完成

### 调试日志

生产版本默认禁用调试日志。如需启用（用于开发/debug）：

1. 打开 `content-script.js`
2. 将 `const DEBUG = false;` 改为 `const DEBUG = true;`
3. 刷新页面

## 注意事项

- 此扩展仅在本地修改 DOM，不影响 Twitter/X 的服务器请求
- 扩展需要 `storage` 权限来保存用户设置
- 仅处理包含 `t.co` 的链接，不影响其他链接
- 如果链接没有 `<span>` 子元素，保持原样不处理
- 链接悬停预览功能在所有网站生效，使用浏览器原生 tooltip

## 故障排除

### 扩展不工作

1. 检查是否访问的是 `twitter.com` 或 `x.com`
2. 刷新页面
3. 打开开发者工具（F12），查看 Console 是否有 `[x-link-replace]` 日志

### 链接未被替换

- 某些链接可能没有 `<span>` 子元素，这是正常行为
- 链接可能已经被处理过（不会重复处理）

### 设置面板不显示

1. 确认已点击扩展图标（不是页面内的任何按钮）
2. 检查 `chrome://extensions/` 中扩展是否已启用
3. 尝试重新加载扩展

### 链接悬停预览不显示

1. 点击扩展图标，打开设置面板
2. 确认 **"Show link URL tooltip on hover"** 已勾选
3. 刷新当前页面

## 卸载

1. 打开 `chrome://extensions/`
2. 找到 `x-link-replace` 扩展
3. 点击 **"移除"** 按钮

## 许可证

ISC License

## License

ISC License - 详见 [LICENSE](LICENSE) 文件

---

## GitHub

本项目已公开到 GitHub，欢迎贡献和反馈。

### 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request
