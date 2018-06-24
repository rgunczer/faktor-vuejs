'use strict';

var app = new Vue({
    el: '#app',
    data: {
        title: 'fAkToR',
        loadingQuestions: false,
        loadingAnswers: false,
        params: {
            xApiKey: '-',
            quizId: '-',
            progressId: '-',
            sectionId: '-'
        },
        solver: {
            quiz: {
                questions: [],
                passingMark: 0
            },
            assessment: {
                score: 0,
                result: '-'
            },
            generations: [],
            stop: true,
            questionIndex: 0
        }
    },
    methods: {
        onSave() {
            this.persist('save')
        },
        onLoad() {
            this.persist('load')
        },
        reset() {
            solver.reset(this.solver)
        },
        onGetQuestions() {
            this.loadingQuestions = true;
            this.reset();
            api.getQuestions(this.params.quizId, this.params.xApiKey)
            .then((data) => {
                console.log(data);
                this.solver.quiz.questions = [];
                this.solver.quiz.passingMark = data.assessment.passing_marks;
                data.assessment.sections[0].questions.forEach(q => {
                    q.answers[0].selected = true;
                    this.solver.quiz.questions.push(q);
                });
            })
            .finally(() => {
                this.loadingQuestions = false;
            })
        },
        onSend() {
            this.loadingAnswers = true;

            const obj = solver.getObjToSend(this.params);

            solver.insertNewGeneration();

            api.postAnswers(obj, this.params.xApiKey)
                .then((data) => {
                    solver.update(data.assessment.user_score, data.assessment.result);

                    if (solver.canContinue()) {
                        solver.calcNext();
                        setTimeout(() => {
                            this.onSend();
                        }, 1000);
                    }
                })
                .finally(() => {
                    this.loadingAnswers = false;
                });
        },
        onBegin() {
            this.solver.stop = false;
            this.persist('save');
            this.onSend();
        },
        onStop() {
            this.solver.stop = true;
        },
        persist(way) {
            const key = 'fAkToRpArAmS';
            if (way === 'save') {
                window.localStorage.setItem(key, JSON.stringify(this.params));
            } else if (way === 'load') {
                const str = window.localStorage.getItem(key);
                if (str) {
                    this.params = JSON.parse(str);
                }
            }
        }
    },
    beforeMount() {
        api.init();
        this.persist('load')
    }
})