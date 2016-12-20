window.addEventListener('load', function () {
    var xhr = new XMLHttpRequest();

    /**
     * Returns random hex color code
     * @returns {String}.
     */
    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split(''),
            color = '#',
            i;
        for (i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    /**
     * Returns timestamp from date
     * @param {String} dateString
     * @returns {Number}.
     */
    function getTimestamp(dateString) {
        var dateArray = dateString.split('.');
        return new Date(dateArray[2], dateArray[1] - 1, dateArray[0]).getTime();
    }

    /**
     * Returns date from timestamp in format '01.01.1970'
     * @param {Number} timestamp
     * @returns {String}.
     */
    function getDateFromTimestamp(timestamp) {
        var date = new Date(timestamp),
            day = date.getDate(),
            month = date.getMonth() + 1,
            year = date.getFullYear();

        day = day >= 10 ? day : '0' + day;
        month = month >= 10 ? month : '0' + month;
        return day + '.' + month + '.' + year;
    }

    /**
     * Returns start and end date for project
     * @param {Object} tasks
     * @returns {Object}.
     */
    function getTasksPeriod(tasks) {
        var firstTask = tasks[0],
            startDate = firstTask.startDate,
            endDate = firstTask.endDate,
            tempStartDate,
            tempEndDate,
            index;

        for (index = 1; index < tasks.length; index++) {
            tempStartDate = tasks[index].startDate;
            if (getTimestamp(tempStartDate) < getTimestamp(startDate)) {
                startDate = tempStartDate;
            }
            tempEndDate = tasks[index].endDate;
            if (getTimestamp(tempEndDate) > getTimestamp(endDate)) {
                endDate = tempEndDate;
            }
        }

        return {
            start: startDate,
            end: endDate
        }
    }

    /**
     * Returns task duration in days
     * @param {String} startDate - '02.04.2016'
     * @param {String} endDate - '02.05.2016'
     * @returns {Number}.
     */
    function getTaskDuration(startDate, endDate) {
        var timestampDiff = getTimestamp(endDate) - getTimestamp(startDate);
        return Math.ceil(timestampDiff / (1000 * 3600 * 24));
    }

    xhr.open('GET', 'data.json', true);
    xhr.addEventListener('readystatechange', function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                var tasks = JSON.parse(this.responseText),
                    tasksPeriod = getTasksPeriod(tasks),
                    tasksDuration = getTaskDuration(tasksPeriod.start, tasksPeriod.end),
                    rowsFragment = document.createDocumentFragment(),
                    chartTable = document.getElementById('chart-table');

                tasks.forEach(function (task) {
                    var row = document.createElement('tr'),
                        taskColumn = document.createElement('td'),
                        graphColumn = document.createElement('td'),
                        taskBlock = document.createElement('div'),
                        taskDuration = getTaskDuration(task.startDate, task.endDate),
                        taskOffset = getTaskDuration(tasksPeriod.start, task.startDate),
                        taskName = task.taskName,
                        subtasks = task.subtasks;

                    row.className = 'chart__row';
                    taskColumn.className = 'chart__cell chart__task-cell';
                    taskColumn.textContent = taskName;
                    graphColumn.className = 'chart__cell chart__graph-cell';
                    taskBlock.className = 'chart__task';
                    taskBlock.style.width = ((taskDuration * 100) / tasksDuration) + '%';
                    taskBlock.style.left = ((taskOffset * 100) / tasksDuration) + '%';
                    taskBlock.style.background = getRandomColor();

                    if (subtasks) {
                        subtasks.forEach(function (subtask) {
                            var subtaskBlock = document.createElement('div'),
                                subtaskDuration = getTaskDuration(subtask.startDate, subtask.endDate),
                                subtaskName = subtask.taskName;

                            subtaskBlock.className = 'chart__subtask';
                            subtaskBlock.style.width = ((subtaskDuration * 100) / taskDuration) + '%';
                            subtaskBlock.style.background = getRandomColor();
                            subtaskBlock.setAttribute('data-title', subtaskName + ': ' + subtask.startDate + ' - ' + subtask.endDate);
                            taskBlock.appendChild(subtaskBlock);
                        });
                    } else {
                        taskBlock.setAttribute('data-title', taskName + ': ' + task.startDate + ' - ' + task.endDate);
                    }

                    graphColumn.appendChild(taskBlock);
                    row.appendChild(taskColumn);
                    row.appendChild(graphColumn);
                    rowsFragment.appendChild(row);
                });

                chartTable.appendChild(rowsFragment);

                (function () {
                    var row = document.createElement('tr'),
                        leftColumn = document.createElement('td'),
                        rightColumn = document.createElement('td'),
                        scaleBlock = document.createElement('div'),
                        initialScale = 7,
                        actualScale,
                        scalePeriod,
                        timestamp,
                        counter,
                        date;

                    row.className = 'chart__row';
                    leftColumn.className = 'chart__cell';
                    rightColumn.className = 'chart__cell';
                    scaleBlock.className = 'chart__scale';

                    for (actualScale = initialScale; actualScale > 0; actualScale--) {
                        if (!(tasksDuration % actualScale)) {
                            scalePeriod = tasksDuration / actualScale;
                            break;
                        }
                    }

                    for (counter = 0; counter <= actualScale; counter++) {
                        timestamp = getTimestamp(tasksPeriod.start) + (counter * scalePeriod * 86400000);
                        date = document.createElement('div');
                        date.className = 'chart__date';
                        date.style.left = ((counter * scalePeriod * 100) / tasksDuration) + '%';
                        date.textContent = getDateFromTimestamp(timestamp);
                        scaleBlock.appendChild(date);
                    }

                    rightColumn.appendChild(scaleBlock);
                    row.appendChild(leftColumn);
                    row.appendChild(rightColumn);
                    chartTable.appendChild(row);
                })();

            } else {
                console.log(this.statusText);
            }
        }
    }, false);
    xhr.send();

}, false);
