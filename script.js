// 初始化BPMN查看器
const bpmnViewer = new BpmnJS({
container: '#canvas'
});
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const canvasEl = document.getElementById('canvas');

async function openDiagram(bpmnXML) {
    try {
        await bpmnViewer.importXML(bpmnXML);
        canvasEl.style.opacity = 1;
        loadingEl.style.display = 'none';
        // 调整视图以适应屏幕
        const canvas = bpmnViewer.get('canvas');
        canvas.zoom('fit-viewport');
    } catch (err) {
        loadingEl.style.display = 'none';
        errorEl.textContent = 'Error rendering BPMN diagram: ' + err.message;
        console.error('Could not import BPMN 2.0 diagram', err);
    }
}

// 页面加载时执行
document.addEventListener('DOMContentLoaded', () => {
    canvasEl.style.opacity = 0;
    const urlParams = new URLSearchParams(window.location.search);
    const bpmnData = urlParams.get('bpmn');

    if (bpmnData) {
        try {
            // 解码从URL获取的BPMN XML数据
            const decodedXml = decodeURIComponent(bpmnData);
            openDiagram(decodedXml);
        } catch (e) {
            loadingEl.style.display = 'none';
            errorEl.textContent = 'Failed to decode BPMN data from URL.';
            console.error(e);
        }
    } else {
        loadingEl.style.display = 'none';
        errorEl.textContent = 'No BPMN data provided in URL. Use ?bpmn=<encoded_xml>';
    }
});
