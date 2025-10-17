// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function () {
    // 1. 初始化bpmn-js Viewer
    const bpmnViewer = new BpmnJS({
        container: '#canvas'
    });

    // 2. 定义下载功能函数
    function download(data, filename, type) {
        // 创建一个Blob对象 [[101]][[161]]
        const blob = new Blob([data], { type: type });
        // 创建一个指向该Blob的URL [[102]]
        const url = window.URL.createObjectURL(blob);
        
        // 创建一个隐藏的a标签来触发下载 [[101]][[103]]
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename; // 设置下载文件名
        document.body.appendChild(a);
        
        // 触发点击事件
        a.click();
        
        // 清理
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
    
    // 3. 绑定下载按钮事件
    const downloadXmlBtn = document.getElementById('download-xml');
    const downloadSvgBtn = document.getElementById('download-svg');

    downloadXmlBtn.addEventListener('click', async () => {
        try {
            // 使用bpmn-js的API来获取当前图表的XML [[45]]
            const { xml } = await bpmnViewer.saveXML({ format: true });
            download(xml, 'process.bpmn', 'application/xml');
        } catch (err) {
            console.error('无法导出BPMN XML', err);
            alert('导出BPMN XML失败!');
        }
    });

    downloadSvgBtn.addEventListener('click', async () => {
        try {
            // 使用bpmn-js的API来获取当前图表的SVG [[23]]
            const { svg } = await bpmnViewer.saveSVG();
            download(svg, 'process.svg', 'image/svg+xml');
        } catch (err) {
            console.error('无法导出SVG', err);
            alert('导出SVG失败!');
        }
    });

    // 4. 定义并执行核心功能：从URL加载BPMN XML
    async function loadFromUrl() {
        try {
            // 从URL的查询参数中获取BPMN XML数据
            const urlParams = new URLSearchParams(window.location.search);
            const xml = urlParams.get('xml');

            if (xml) {
                // 对XML进行解码
                const decodedXml = decodeURIComponent(xml);
                // 使用bpmn-js的importXML API来渲染图表 [[38]][[81]]
                await bpmnViewer.importXML(decodedXml);
                
                // 视图自适应缩放
                const canvas = bpmnViewer.get('canvas');
                canvas.zoom('fit-viewport');
            } else {
                // 如果没有提供XML，显示一个默认的空图或提示
                const defaultXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="173" y="102" width="36" height="36"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
                await bpmnViewer.importXML(defaultXml);
                alert("没有在URL中找到BPMN数据，已显示一个空流程。");
            }
        } catch (err) {
            console.error('加载BPMN时出错:', err);
            alert('加载BPMN流程图失败，请检查数据格式是否正确。');
        }
    }

    // 页面加载后立即执行
    loadFromUrl();
});
