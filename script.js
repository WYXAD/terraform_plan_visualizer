document.addEventListener('DOMContentLoaded', function() {
    const visualizeBtn = document.getElementById('visualize-btn');
    const sideBySideCheckbox = document.getElementById('side-by-side');
    const showOptions = document.querySelectorAll('.show-option');
    
    // 初始化高亮
    hljs.highlightAll();
    
    visualizeBtn.addEventListener('click', function() {
        const input = document.getElementById('terraform-input').value;
        const outputDiv = document.getElementById('output');
        outputDiv.innerHTML = '';
        
        if (!input.trim()) {
            outputDiv.textContent = 'Please enter Terraform plan output';
            return;
        }
        
        // 处理显示选项
        const visibleTypes = Array.from(showOptions)
            .filter(opt => opt.checked)
            .map(opt => opt.dataset.type);
        
        // 设置横向对比模式
        if (sideBySideCheckbox.checked) {
            outputDiv.classList.add('side-by-side');
        } else {
            outputDiv.classList.remove('side-by-side');
        }
        
        // 创建按类型分组的容器
        const typeContainers = {
            create: document.createElement('div'),
            update: document.createElement('div'),
            destroy: document.createElement('div'),
            replace: document.createElement('div')
        };
        
        Object.values(typeContainers).forEach(container => {
            outputDiv.appendChild(container);
        });
        
        const lines = input.split('\n');
        let currentBlock = null;
        let currentType = null;
        
        lines.forEach(line => {
            line = line.trim();
            if (!line) return;
            
            // 解析资源块
            if (line.startsWith('#') && (line.includes('will be created') || 
                                       line.includes('will be updated') || 
                                       line.includes('will be destroyed') || 
                                       line.includes('must be replaced'))) {
                if (currentBlock && currentType) {
                    typeContainers[currentType].appendChild(currentBlock);
                }
                
                currentBlock = document.createElement('div');
                
                if (line.includes('created')) {
                    currentBlock.className = 'resource-block create';
                    currentType = 'create';
                } else if (line.includes('updated')) {
                    currentBlock.className = 'resource-block update';
                    currentType = 'update';
                } else if (line.includes('destroyed')) {
                    currentBlock.className = 'resource-block destroy';
                    currentType = 'destroy';
                } else if (line.includes('replaced')) {
                    currentBlock.className = 'resource-block replace';
                    currentType = 'replace';
                }
                
                const header = document.createElement('h3');
                header.textContent = line;
                currentBlock.appendChild(header);
            } 
            // 解析资源详情
            else if (line.startsWith('resource "') && currentBlock) {
                const resourceLine = document.createElement('div');
                resourceLine.textContent = line;
                resourceLine.classList.add('hljs');
                currentBlock.appendChild(resourceLine);
            }
            // 解析变更内容
            else if (line.includes('->')) {
                if (!currentBlock) return;
                
                const changeLine = document.createElement('div');
                changeLine.className = 'change-line';
                const [before, after] = line.split('->').map(p => p.trim());
                
                changeLine.innerHTML = `
                    <span class="old-value">${before}</span>
                    <span class="arrow"> → </span>
                    <span class="new-value">${after}</span>
                `;
                currentBlock.appendChild(changeLine);
            }
        });
        
        // 添加最后一个块
        if (currentBlock && currentType) {
            typeContainers[currentType].appendChild(currentBlock);
        }
        
        // 根据显示选项过滤内容
        Object.entries(typeContainers).forEach(([type, container]) => {
            container.style.display = visibleTypes.includes(type) ? 'block' : 'none';
        });
        
        // 重新高亮
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    });
    
    // 当显示选项变化时重新渲染
    showOptions.forEach(option => {
        option.addEventListener('change', () => {
            if (document.getElementById('output').innerHTML) {
                visualizeBtn.click();
            }
        });
    });
    
    // 当横向对比模式变化时重新渲染
    sideBySideCheckbox.addEventListener('change', () => {
        if (document.getElementById('output').innerHTML) {
            visualizeBtn.click();
        }
    });
});
