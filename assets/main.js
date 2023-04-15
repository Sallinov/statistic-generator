let data = []
let position = 1
const rows = [...document.querySelectorAll('.row')]

document.body.addEventListener('click', event => {
    let parent
    if (event.target.closest('.js-question-counter button')) {
        parent = event.target.closest('.js-question-counter')
        if (validateField(parent)) {
            position = 2
            generateQuestionData(parent.querySelector('input').value)
        }
        checkPosition ()
    }
    if (event.target.closest('.js-sex-status button')) {
        parent = event.target.closest('.js-sex-status')
        if (validateField(parent)) position = 3
        checkPosition ()
    }
    if (event.target.closest('.js-question-data button')) {
        parent = event.target.closest('.js-question-data')
        if (validateField(parent)) position = 4
        checkPosition ()
    }
    if (event.target.closest('.js-people-counter button')) {
        parent = event.target.closest('.js-people-counter')
        if (validateField(parent)) position = 5
        checkPosition ()
    }
    if (event.target.closest('.js-genegate-result button')) {
        data = []
        getStats()
        generateMaiContent()
    }
    if (event.target.closest('.js-tabs .tabs__elem:not(.open) .js-tab-activator')) {
        parent = event.target.closest('.js-tabs .tabs__elem')
        const activeItem = document.querySelector('.js-tabs .tabs__elem.open')
        activeItem.classList.remove('open')
        parent.classList.add('open')
        initCharts (parent.dataset.id)
    }
    if (event.target.closest('.error') || event.target.closest('.valid')) {
        event.target.closest('.field').classList = 'field'
        const rowElem = event.target.closest('.row.long') || event.target.closest('.row')
        let index = [...document.querySelector('aside').children].indexOf(rowElem)
        position = index
        hideRows(index + 1)
    }
})

function validateField (parent) {
    const fields = [...parent.querySelectorAll('.field')]
    const inputs = [...parent.querySelectorAll('input')]
    let validStatus = true
    inputs.forEach((input, counter) => {
        let status = 'valid'
        if (input.value.length) {
            if (input.type === 'number') {
                if (
                    parseInt(input.value > input.max) 
                    || 
                    parseInt(input.value < input.min)
                )
                    status = 'error'
            }
        } else {
            status = 'error'
            validStatus = false
        }
        if (fields[counter]) {
            fields[counter].classList = 'field'
            fields[counter].classList.add(status)
        }
    })
    return validStatus
}

function checkPosition () {
    rows[position - 1].classList.remove('hidden')
    data = []
}

function generateMaiContent() {
    const parent = document.querySelector('.js-tabs')
    const sexStatus = document.querySelector('.js-sex-status input:checked').value === 'on'
    parent.innerHTML = ''
    document.body.classList.remove('default')
    data.forEach ((elem, counter) => {
        parent.innerHTML += `
            <div data-id="${counter}" class="tabs__elem${counter === 0 ? ' open' : ''}">
                <button class="tabs__activator js-tab-activator">
                    Ответы на вопрос №${counter + 1}
                </button>
                <div class="tabs__content">
                    ${
                        !sexStatus
                        ? 
                        '<div class="js-chart"></div>\n'
                        :
                        '<div class="js-chart-male"></div>\n<div class=" js-chart-female"></div>\n'
                    }
                </div>
            </div>\n
        `
    })
    initCharts(0)
}

function initCharts (id) {
    let series = new Map()
    const sexStatus = document.querySelector('.js-sex-status input:checked').value === 'on'
    if (sexStatus) {
        const maleRes = data[id].results.male.length
        const femaleRes = data[id].results.female.length
        const allRes = maleRes + femaleRes
        data[id].results.male.forEach(el => {
            if (!series.get(el.answer)) {
                series.set(el.answer, 1)
            } else {
                series.set(el.answer, ( series.get(el.answer) + 1 ))
            }
            el.answer
        })
        chartHelper(
            [...series.values()],
            [...series.keys()],
            '.tabs__elem.open .js-chart-male',
            `
                Статистика мужчин  
                (${parseInt(maleRes * 100 / allRes)}%)
            `
        )

        series.clear()

        data[id].results.female.forEach(el => {
            if (!series.has(el.answer)) {
                series.set(el.answer, 1)
            } else {
                series.set(el.answer, ( series.get(el.answer) + 1 ))
            }
            el.answer
        })
        chartHelper(
            [...series.values()],
            [...series.keys()],
            '.tabs__elem.open .js-chart-female',
            `
                Статистика женщин 
                (${100 - parseInt(maleRes * 100 / allRes)}%)
            `
        )
    } else {
        data[id].results.forEach(el => {
            if (!series.has(el.answer)) {
                series.set(el.answer, 1)
            } else {
                series.set(el.answer, ( series.get(el.answer) + 1 ))
            }
            el.answer
        })
        chartHelper(
            [...series.values()],
            [...series.keys()],
            '.tabs__elem.open .js-chart',
            'Общая статистика'
        )
    }
}

function chartHelper (values, labels, selector, legend) {
    const elem = document.querySelector(selector)
    if (elem.classList.contains('inited')) return false
    const options = {
        series: values,
        chart: {
            width: '450px',
            type: 'pie',
        },
        labels: labels.map(label => `вариант ${label}`),
        title: {
            text: legend
        },
        dataLabels: {
            formatter(val) {
                return `${val.toFixed(1)}%`
            }
        }
    }

    const chart = new ApexCharts(elem, options)
    elem.classList.add('inited')
    chart.render()
}

function hideRows (from) {
    if (from >= rows.length) return false

    for(from; from < rows.length; from++) {
        rows[from].classList.add('hidden')
    }
}

function generateQuestionData (counter) {
    let resHTML = ''
    for (let i = 1; i <= counter; i++) {
        resHTML += `
        <div class="row">
            <div class="field">
                <fieldset>
                    <legend>Текст вопроса</legend>
                    <input name="name-${i}" value="${i}. " type="text"/>
                </fieldset>
                <div class="field__error">
                    Не пустое
                </div>
            </div>
            <div class="field">
                <fieldset>
                    <legend>Кол-во ответов</legend>
                    <input name="answers-${i}" type="number" min="1" max="10"/>
                </fieldset>
                <div class="field__error">
                    Число от 1 до 10
                </div>
            </div>
        </div>
        \n
        `
    }
    resHTML += '<button>применить</button>'
    document.querySelector('.js-question-data').innerHTML = resHTML
}

function getStats () {
    generateData()
}

function generateData () {
    const sexStatus = document.querySelector('.js-sex-status input:checked').value === 'on'
    const names = document.querySelectorAll('.js-question-data input[name^="name-"]')
    const answers = document.querySelectorAll('.js-question-data input[name^="answers-"]')
    const peoples = parseInt(document.querySelector('.js-people-counter input').value)
    for (let count = 0; count < names.length; count++) {
        data.push(
            {
                label: names[count].value,
                answers: parseInt(answers[count].value),
                results: sexStatus ? {} : []
            }
        )
    }

    
    for (let i = 0; i < peoples; i++) {
        const sex = getSex()
        data.map((question, counter) => {
            if (sexStatus) {
                if (!question['results'][sex]) {
                    question['results'][sex] = []
                }
                question['results'][sex].push( {
                    question: counter + 1,
                    answer: getAnswer(question.answers + 1)
                } )
            } else {
                question['results'].push( {
                    question: counter + 1,
                    answer: getAnswer(question.answers + 1)
                } )
            }
        })
    }
}

function getSex () {
    return ['male', 'female'][parseInt(Math.random() * 2)]
}

function getAnswer (max, min = 1) {
    return parseInt(Math.random() * (max - min) + min)
}
