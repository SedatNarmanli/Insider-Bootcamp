document.addEventListener('DOMContentLoaded', function() {
    // DOM elementlerini seç
    const taskForm = document.getElementById('taskForm');
    const taskNameInput = document.getElementById('taskName');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskPriorityRadios = document.getElementsByName('taskPriority');
    const taskList = document.getElementById('taskList');
    const noTasksMessage = document.getElementById('noTasks');
    const taskNameError = document.getElementById('taskNameError');
    const taskPriorityError = document.getElementById('taskPriorityError');
    const formAlert = document.getElementById('formAlert');
    const toggleCompletedBtn = document.getElementById('toggleCompletedBtn');
    const sortByPriorityBtn = document.getElementById('sortByPriorityBtn');
    const searchInput = document.getElementById('searchInput');

    // İstatistik elementleri
    const totalTasksElement = document.getElementById('totalTasks');
    const completedTasksElement = document.getElementById('completedTasks');
    const pendingTasksElement = document.getElementById('pendingTasks');
    const progressBarElement = document.getElementById('progressBar');

    // Değişkenler
    let tasks = [];
    let showOnlyCompleted = false;
    let currentSearch = '';
    let sortByPriority = false;
    const priorityValues = { 'high': 3, 'medium': 2, 'low': 1 };

    

    // Form gönderildiğinde görev ekleme
    taskForm.addEventListener('submit', function(event) {
        event.preventDefault();

        try {
            // Form doğrulama
            resetFormErrors();
            const isValid = validateForm();

            if (isValid) {
                // Yeni görev oluştur
                const newTask = {
                    id: Date.now(),
                    name: taskNameInput.value.trim(),
                    description: taskDescriptionInput.value.trim(),
                    priority: getSelectedPriority(),
                    completed: false,
                    createdAt: new Date()
                };

                // Görevi listeye ekle ve formu temizle
                tasks.push(newTask);
                // localStorage'a kaydetme kısmını kaldırdık
                renderTasks();
                updateStats();
                taskForm.reset();
                
                // Animasyonlu bildirim
                showNotification('Görev başarıyla eklendi!', 'success');
            }
        } catch (error) {
            // Beklenmedik hata durumunda
            showFormAlert("Beklenmedik bir hata oluştu: " + error.message);
            console.error("Hata oluştu:", error);
        }
    });

    // Görev listesindeki tıklama olaylarını delegasyon ile izle
    taskList.addEventListener('click', function(event) {
        // Event bubbling'i engelle
        event.stopPropagation();

        const target = event.target;
        const taskItem = target.closest('.task-item');

        if (!taskItem) return;

        const taskId = parseInt(taskItem.dataset.id);

        // Görev tamamlandı butonuna tıklandıysa
        if (target.classList.contains('complete-btn') || target.parentElement.classList.contains('complete-btn')) {
            toggleTaskCompletion(taskId);
        }
        // Görev silme butonuna tıklandıysa
        else if (target.classList.contains('delete-btn') || target.parentElement.classList.contains('delete-btn')) {
            deleteTask(taskId);
        }
    });

    // Sadece tamamlananları göster butonu
    toggleCompletedBtn.addEventListener('click', function() {
        showOnlyCompleted = !showOnlyCompleted;
        this.classList.toggle('active');
        this.innerHTML = showOnlyCompleted ? 
            '<i class="fas fa-filter"></i> Tüm Görevler' : 
            '<i class="fas fa-filter"></i> Tamamlananlar';
        renderTasks();
    });

    // Önceliğe göre sırala butonu
    sortByPriorityBtn.addEventListener('click', function() {
        sortByPriority = !sortByPriority;
        this.classList.toggle('active');
        renderTasks();
    });

    // Arama inputu
    searchInput.addEventListener('input', function() {
        currentSearch = this.value.trim().toLowerCase();
        renderTasks();
    });

    // Görevleri listele
    function renderTasks() {
        // Filtreleme yap
        const filteredTasks = tasks.filter(task => {
            // Arama filtresi
            const matchesSearch = task.name.toLowerCase().includes(currentSearch) || 
                                (task.description && task.description.toLowerCase().includes(currentSearch));
            
            // Tamamlanma filtresi
            const matchesCompletion = !showOnlyCompleted || task.completed;
            
            return matchesSearch && matchesCompletion;
        });
        
        // Sırala
        let sortedTasks = [...filteredTasks];
        
        if (sortByPriority) {
            sortedTasks.sort((a, b) => priorityValues[b.priority] - priorityValues[a.priority]);
        } else {
            // Varsayılan olarak eklenme tarihine göre sırala (en yeniden en eskiye)
            sortedTasks.sort((a, b) => b.id - a.id);
        }
        
        // Görev listesini temizle
        taskList.innerHTML = '';
        
        // Boş durum kontrolü
        if (sortedTasks.length === 0) {
            noTasksMessage.style.display = 'flex';
        } else {
            noTasksMessage.style.display = 'none';
            
            // Görevleri DOM'a ekle
            sortedTasks.forEach(task => {
                const taskElement = createTaskElement(task);
                taskList.appendChild(taskElement);
            });
        }
    }
    
    // Görev elementi oluştur
    function createTaskElement(task) {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.dataset.id = task.id;
        
        // Öncelik rengini belirle
        let priorityClass = '';
        let priorityLabel = '';
        
        switch(task.priority) {
            case 'low':
                priorityClass = 'low';
                priorityLabel = 'Düşük';
                break;
            case 'medium':
                priorityClass = 'medium';
                priorityLabel = 'Orta';
                break;
            case 'high':
                priorityClass = 'high';
                priorityLabel = 'Yüksek';
                break;
        }
        
        taskItem.innerHTML = `
            <div class="task-info">
                <h3 class="task-title">${escapeHTML(task.name)}</h3>
                ${task.description ? `<p class="task-description">${escapeHTML(task.description)}</p>` : ''}
                <span class="priority-badge ${priorityClass}">${priorityLabel}</span>
            </div>
            <div class="task-actions">
                <button class="action-btn complete-btn" title="${task.completed ? 'Tamamlanmadı olarak işaretle' : 'Tamamlandı olarak işaretle'}">
                    <i class="fas ${task.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                </button>
                <button class="action-btn delete-btn" title="Görevi Sil">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        return taskItem;
    }
    
    // Görevi tamamlandı/tamamlanmadı olarak işaretle
    function toggleTaskCompletion(taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            // localStorage'a kaydetme kısmını kaldırdık
            renderTasks();
            updateStats();
            
            // Bildirim göster
            const message = tasks[taskIndex].completed ? 
                'Görev tamamlandı olarak işaretlendi!' : 
                'Görev tamamlanmadı olarak işaretlendi!';
            showNotification(message, 'success');
        }
    }
    
    // Görevi sil
    function deleteTask(taskId) {
        if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
            tasks = tasks.filter(task => task.id !== taskId);
            // localStorage'a kaydetme kısmını kaldırdık
            renderTasks();
            updateStats();
            
            // Bildirim göster
            showNotification('Görev silindi!', 'error');
        }
    }
    
    // Önceliğe göre sırala
    function sortTasksByPriority() {
        tasks.sort((a, b) => {
            return priorityValues[b.priority] - priorityValues[a.priority];
        });
    }

    // Seçilen önceliği al
    function getSelectedPriority() {
        for (const radio of taskPriorityRadios) {
            if (radio.checked) {
                return radio.value;
            }
        }
        return '';
    }

    // Form doğrulama fonksiyonu
    function validateForm() {
        let isValid = true;

        // Görev adı kontrol
        if (!taskNameInput.value.trim()) {
            taskNameError.style.display = 'block';
            taskNameInput.classList.add('error-input');
            isValid = false;
        }

        // Öncelik kontrol
        if (!getSelectedPriority()) {
            taskPriorityError.style.display = 'block';
            isValid = false;
        }

        return isValid;
    }

    // Form hatalarını sıfırla
    function resetFormErrors() {
        taskNameError.style.display = 'none';
        taskPriorityError.style.display = 'none';
        formAlert.style.display = 'none';
        taskNameInput.classList.remove('error-input');
    }

    // Form uyarısı göster
    function showFormAlert(message) {
        formAlert.textContent = message;
        formAlert.style.display = 'block';
        setTimeout(() => {
            formAlert.style.display = 'none';
        }, 5000);
    }
    
    // HTML karakterlerini escape et (XSS koruması)
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Bildirim gösterme
    function showNotification(message, type) {
        // CSS stillerini ekle (eğer yoksa)
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 25px;
                    background-color: white;
                    color: #333;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 1000;
                    transform: translateX(120%);
                    transition: transform 0.3s ease;
                    max-width: 300px;
                }
                .notification.success {
                    border-left: 4px solid var(--success-color);
                }
                .notification.error {
                    border-left: 4px solid var(--error-color);
                }
                .notification.show {
                    transform: translateX(0);
                }
            `;
            document.head.appendChild(style);
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animasyon için zamanlayıcılar
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // İstatistikleri güncelle
    function updateStats() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Sayıları animasyonlu şekilde güncelle
        animateCounter(totalTasksElement, totalTasks);
        animateCounter(completedTasksElement, completedTasks);
        animateCounter(pendingTasksElement, pendingTasks);
        
        // İlerleme çubuğunu güncelle
        progressBarElement.style.width = `${completionRate}%`;
        progressBarElement.textContent = `${completionRate}%`;
    }
    
    // Sayaç animasyonu
    function animateCounter(element, targetNumber) {
        const currentNumber = parseInt(element.textContent) || 0;
        const diff = targetNumber - currentNumber;

        if (diff === 0) return;

        let step = Math.sign(diff); // Burada step değeri hesaplanıyor

        let counter = currentNumber;
        const interval = setInterval(() => {
            counter += step;
            element.textContent = counter;

            if (counter === targetNumber) {
                clearInterval(interval);
            }
        }, 50);
    }
    
    // Başlangıç durumu - görevleri listele
    renderTasks();
});