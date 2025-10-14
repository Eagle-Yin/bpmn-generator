// COZE代码节点专用BPMN渲染处理器
class BpmnRenderer {
    constructor() {
        this.viewer = null;
        this.isInitialized = false;
    }

    // 初始化BPMN查看器
    async initialize() {
        try {
            // 动态加载bpmn-js库
            await this.loadBpmnJsLibrary();
            
            this.viewer = new BpmnJS({
                container: '#canvas',
                keyboard: { bindTo: document },
                additionalModules: []
            });

            this.isInitialized = true;
            console.log('BPMN查看器初始化成功');
            return true;
        } catch (error) {
            console.error('BPMN查看器初始化失败:', error);
            this.showError('初始化失败: ' + error.message);
            return false;
        }
    }

    // 动态加载bpmn-js库
    async loadBpmnJsLibrary() {
        return new Promise((resolve, reject) => {
            if (typeof BpmnJS !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://unpkg.com/bpmn-js@^8.0.0/dist/bpmn-viewer.production.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load bpmn-js library'));
            
            document.head.appendChild(script);
        });
    }

    // 渲染BPMN图表
    async renderDiagram(bpmnXML) {
        if (!this.isInitialized) {
            const initialized = await this.initialize();
            if (!initialized) return false;
        }

        try {
            this.showLoading('正在解析BPMN XML...');

            // 清理和验证XML
            const cleanedXml = this.cleanBpmnXml(bpmnXML);
            if (!this.validateBpmnXml(cleanedXml)) {
                throw new Error('无效的BPMN XML格式');
            }

            // 导入和渲染
            const { warnings } = await this.viewer.importXML(cleanedXml);
            
            if (warnings && warnings.length > 0) {
                console.warn('BPMN导入警告:', warnings);
            }

            // 调整视图
            this.viewer.get('canvas').zoom('fit-viewport');
            
            this.showSuccess('流程图渲染成功');
            this.setupZoomControls();
            
            return true;
        } catch (error) {
            console.error('BPMN渲染错误:', error);
            this.showError('渲染失败: ' + error.message);
            return false;
        }
    }

    // 清理BPMN XML
    cleanBpmnXml(xmlString) {
        let cleaned = xmlString.trim();
        
        // 移除可能的Markdown代码块
        const markdownMatch = cleaned.match(/```
(?:xml)?\s*([\s\S]*?)```/);
        if (markdownMatch && markdownMatch[1]) {
            cleaned = markdownMatch[1].trim();
        }

        // 移除XML声明前的任何文本
        const xmlDeclarationIndex = cleaned.indexOf('<?xml');
        if (xmlDeclarationIndex > 0) {
            cleaned = cleaned.substring(xmlDeclarationIndex);
        }

        return cleaned;
    }

    // 验证BPMN XML
    validateBpmnXml(xmlString) {
        return xmlString.includes('<?xml') && 
               xmlString.includes('<bpmn:definitions') && 
               xmlString.includes('http://www.omg.org/spec/BPMN/20100524/MODEL');
    }

    // 显示加载状态
    showLoading(message) {
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.textContent = message;
            loadingEl.style.display = 'block';
        }
        
        const errorEl = document.getElementById('error');
        const successEl = document.getElementById('success');
        if (errorEl) errorEl.style.display = 'none';
        if (successEl) successEl.style.display = 'none';
    }

    // 显示错误信息
    showError(message) {
        const errorEl = document.getElementById('error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
        
        const loadingEl = document.getElementById('loading');
        const successEl = document.getElementById('success');
        if (loadingEl) loadingEl.style.display = 'none';
        if (successEl) successEl.style.display = 'none';
    }

    // 显示成功信息
    showSuccess(message) {
        const successEl = document.getElementById('success');
        if (successEl) {
            successEl.textContent = message;
            successEl.style.display = 'block';
        }
        
        const loadingEl = document.getElementById('loading');
        const errorEl = document.getElementById('error');
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) errorEl.style.display = 'none';
    }

    // 设置缩放控制
    setupZoomControls() {
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        const resetViewBtn = document.getElementById('reset-view');

        if (zoomInBtn) {
            zoomInBtn.onclick = () => this.zoom(0.2);
        }
        if (zoomOutBtn) {
            zoomOutBtn.onclick = () => this.zoom(-0.2);
        }
        if (resetViewBtn) {
            resetViewBtn.onclick = () => this.viewer.get('canvas').zoom('fit-viewport');
        }
    }

    // 缩放功能
    zoom(delta) {
        const canvas = this.viewer.get('canvas');
        const currentZoom = canvas.zoom();
        canvas.zoom(currentZoom + delta);
    }
}

// 全局渲染器实例
let bpmnRenderer;

// 主初始化函数
async function initializeBpmnViewer() {
    bpmnRenderer = new BpmnRenderer();
    
    // 从URL参数获取BPMN数据
    const urlParams = new URLSearchParams(window.location.search);
    const bpmnData = urlParams.get('bpmn');

    if (bpmnData) {
        try {
            // URL解码
            const decodedXml = decodeURIComponent(bpmnData);
            await bpmnRenderer.renderDiagram(decodedXml);
        } catch (error) {
            console.error('URL解码失败:', error);
            bpmnRenderer.showError('数据解码失败: ' + error.message);
        }
    } else {
        bpmnRenderer.showError('未提供BPMN数据。请通过URL参数传递BPMN XML。');
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBpmnViewer);
} else {
    initializeBpmnViewer();
}

// 导出供COZE代码节点使用的函数
window.getBpmnRenderer = () => bpmnRenderer;
window.initializeBpmnViewer = initializeBpmnViewer;

console.log('BPMN渲染器脚本加载完成');
