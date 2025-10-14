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
    // 在页面上显示更详细的错误信息，帮助调试
        errorEl.innerHTML = `
            <p>渲染BPMN图表失败。</p>
            <p>可能原因：XML格式无效、BPMN语义错误（如缺少sourceRef/targetRef，见资料）或命名空间问题（见资料）。</p>
            <p>详细错误信息已输出到浏览器控制台（F12查看）。</p>
        `;
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
      console.error('URL Decode Error:',e);
    }
  } else {
    loadingEl.style.display = 'none';
    errorEl.textContent = 'No BPMN data provided in URL. Use ?bpmn=';
  }
});
