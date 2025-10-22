// 立即执行函数，避免污染全局作用域
(async function() {
    const canvas = document.getElementById('canvas');
    const loading = document.getElementById('loading');
    const downloadBpmnButton = document.getElementById('download-bpmn');
    const downloadSvgButton = document.getElementById('download-svg');

    // 初始化BPMN查看器
    const bpmnViewer = new BpmnJS({
        container: canvas
    });

    // 文件下载辅助函数
    function downloadFile(filename, data, mimeType) {
        const blob = new Blob([data], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    try {
        // 从URL的查询参数中获取XML数据
        const urlParams = new URLSearchParams(window.location.search);
        const xmlDataEncoded = urlParams.get('xml');

        if (!xmlDataEncoded) {
            throw new Error("URL中未找到'xml'参数。");
        }

        // 解码XML数据
        const xmlData = decodeURIComponent(xmlDataEncoded);
        
        // 使用BPMN.JS导入并渲染XML
        await bpmnViewer.importXML(xmlData);

        // 调整视图使其居中显示
        bpmnViewer.get('canvas').zoom('fit-viewport', 'auto');

        loading.style.display = 'none'; // 隐藏加载提示

        // 绑定下载BPMN按钮事件
        downloadBpmnButton.addEventListener('click', async () => {
            const { xml } = await bpmnViewer.saveXML({ format: true });
            downloadFile('process.bpmn', xml, 'application/xml');
        });

        // 绑定下载SVG按钮事件
        downloadSvgButton.addEventListener('click', async () => {
            const { svg } = await bpmnViewer.saveSVG();
            downloadFile('process.svg', svg, 'image/svg+xml');
        });

    } catch (err) {
        // 错误处理
        loading.innerText = '加载失败: ' + err.message;
        console.error('无法加载BPMN图:', err);
    }
})();
