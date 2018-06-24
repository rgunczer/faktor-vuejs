'use strict';

var solver = (function() {

    var data;

    function reset(solverData) {
        data = solverData;

        data.stop = true;

        data.generations = [];
        data.questionIndex = 0;

        data.quiz.questions = [];
        data.quiz.passingMark = 0;

        data.assessment.score = 0;
        data.assessment.result = '';
    }

    function getCurrentAnswerForQuestion(q) {
        for(let i = 0; i < q.answers.length; ++i) {
            if (q.answers[i].selected) {
                return [ q.answers[i].id ];
            }
        }
    }

    function getQuestionsWithAnswers(questions) {
        var qa = [];
        questions.forEach(q => {
            qa.push({
                question_id: q.id,
                answer_ids: getCurrentAnswerForQuestion(q)
            });
        });
        return qa;
    }

    function getCurrentGeneration() {
        var gen = data.generations[data.generations.length - 1];
        return gen;
    }

    function updateCurrentGenerationWithAssessmentResults() {
        var gen = getCurrentGeneration();
        gen.score = data.assessment.score;
        gen.result = data.assessment.result;
    }

    function getSelectedAnswerIndex(q) {
        for(let i = 0; i < q.answers.length; ++i) {
            if (q.answers[i].selected) {
                return i;
            }
        }
    }

    function getCurrentQuestion() {
        var q = data.quiz.questions[data.questionIndex];
        return q;
    }

    function insertNewGeneration() {
        data.generations.push({
            score: -1,
            result: '...',
            questionIndex: data.questionIndex,
            answerIndex: getSelectedAnswerIndex(getCurrentQuestion())
        });
    }

    function getObjToSend(params) {
        return {
            progress_id: params.progressId,
            content_id: params.quizId,
            sections: [
                {
                    section_id: params.sectionId,
                    questions: getQuestionsWithAnswers(data.quiz.questions)
                }
            ]
        };
    }

    function getLastQuestion() {
        var q = data.quiz.questions[data.quiz.questions.length - 1];
        return q;
    }

    function getLastGeneration() {
        var gen = data.generations[data.generations.length - 2];
        return gen;
    }

    function update(userScore, result) {
        data.assessment.score = userScore;
        data.assessment.result = result;
        updateCurrentGenerationWithAssessmentResults();
    }

    function calcNext() {

        function selectNextAnswer(q) {
            let index = getSelectedAnswerIndex(q);
            let length = q.answers.length;

            if (index < length - 1) {
                q.answers[index].selected = false;
                q.answers[++index].selected = true;
                return true;
            }
            return false;
        }

        function moveToNextQuestion() {
            let question = getCurrentQuestion();
            let lastQuestion = getLastQuestion();

            if (question.id !== lastQuestion.id) {
                ++data.questionIndex;
            }
        }

        function checkToStop() { // FIXME: rewrite
            let question = getCurrentQuestion();
            let lastQuestion = getLastQuestion();

            if (question.id === lastQuestion.id) {
                let answerIndex = getSelectedAnswerIndex(question);
                if (answerIndex === question.answers.length - 1) {
                    solver.stop = true;
                }
            }
        }

        function markCorrectAnswerInGeneration(g) {
            g.info = 'Correct!';
        }

        function compareGenerationsAndSelectNextQuestionOrAnswer() {
            let question = getCurrentQuestion();
            let answerIndex = getSelectedAnswerIndex(question);
            let lastGeneration = getLastGeneration();
            let currentGeneration = getCurrentGeneration();

            if (currentGeneration.score > lastGeneration.score) {
                markCorrectAnswerInGeneration(currentGeneration);
                moveToNextQuestion();
            } else if (currentGeneration.score < lastGeneration.score) {
                question.answers[answerIndex].selected = false;
                question.answers[answerIndex - 1].selected = true;
                currentGeneration.score = lastGeneration.score; // adjust score!
                markCorrectAnswerInGeneration(lastGeneration);
                moveToNextQuestion();
            } else if (currentGeneration.score === lastGeneration.score) {
                selectNextAnswer(question);
            }
        }

        if (data.generations.length >= 2) {
            compareGenerationsAndSelectNextQuestionOrAnswer();
        } else {
            let question = getCurrentQuestion();
            selectNextAnswer(question);
        }
        checkToStop(); // FIXME: rewrite!
    }

    function canContinue() {
        console.log('assessment.result: ' + data.assessment.result);
        console.log('solver.stop: ' + data.stop);

        let can = data.assessment.result === 'FAIL' && !data.stop;
        console.log('canContinue - [' + can + ']');
        return can;
    }

    return {
        reset: reset,
        getCurrentAnswerForQuestion: getCurrentAnswerForQuestion,
        getQuestionsWithAnswers: getQuestionsWithAnswers,
        updateCurrentGenerationWithAssessmentResults: updateCurrentGenerationWithAssessmentResults,
        insertNewGeneration: insertNewGeneration,
        getObjToSend: getObjToSend,
        getSelectedAnswerIndex: getSelectedAnswerIndex,
        getCurrentQuestion: getCurrentQuestion,
        getCurrentGeneration: getCurrentGeneration,
        getLastQuestion: getLastQuestion,
        getLastGeneration: getLastGeneration,
        update: update,
        calcNext: calcNext,
        canContinue: canContinue
    }

})();