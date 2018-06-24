'use strict';

Vue.component('question', {
    props: ['q', 'index'],
    template: `
<div>
    <strong>
        <div>nr: {{ index }}</div>
        <div>id: {{ q.id }}</div>
        <div>question: {{ q.question }}</div>
        <div>type: {{ q.question_type }}</div>
    </strong>
    <div v-for="a in q.answers">
        id: {{ a.id }}
        answer: {{ a.answer }}
        <input type="checkbox" v-model="a.selected">
    </div>
    <br>
</div>`
})