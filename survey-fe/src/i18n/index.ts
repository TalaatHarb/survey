import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // App
      'app.title': 'Survey Builder',
      'app.loading': 'Loading...',
      'app.error': 'An error occurred',
      
      // Navigation
      'nav.surveys': 'Surveys',
      'nav.questions': 'Question Bank',
      'nav.newSurvey': 'New Survey',
      
      // Survey list
      'surveys.title': 'Surveys',
      'surveys.create': 'Create Survey',
      'surveys.search': 'Search surveys...',
      'surveys.empty': 'No surveys yet',
      'surveys.published': 'Published',
      'surveys.draft': 'Draft',
      'surveys.questions': '{{count}} question(s)',
      
      // Survey editor
      'editor.title': 'Survey Editor',
      'editor.tabs.edit': 'Edit',
      'editor.tabs.preview': 'Preview',
      'editor.tabs.results': 'Results',
      'editor.surveyTitle': 'Survey Title',
      'editor.surveyDescription': 'Survey Description (optional)',
      'editor.publish': 'Publish',
      'editor.unpublish': 'Unpublish',
      'editor.save': 'Save',
      'editor.delete': 'Delete',
      'editor.noQuestions': 'No questions added yet',
      'editor.addQuestion': 'Add a question from the question bank or create a new one',
      
      // Question bank
      'questionBank.title': 'Question Bank',
      'questionBank.search': 'Search questions...',
      'questionBank.add': 'Add to Survey',
      'questionBank.copy': 'Copy Question',
      'questionBank.empty': 'No questions found',
      
      // Mobile editor panels
      'editor.canvas': 'Canvas',
      'editor.questionBank': 'Questions',
      'editor.toolbox': 'Toolbox',
      
      // Toolbox
      'toolbox.title': 'Add New Question',
      'toolbox.surveySettings': 'Survey Settings',
      
      // Question types
      'questionType.SHORT_ANSWER': 'Short Answer',
      'questionType.PARAGRAPH': 'Paragraph',
      'questionType.MULTIPLE_CHOICE': 'Multiple Choice',
      'questionType.CHECKBOXES': 'Checkboxes',
      'questionType.DROPDOWN': 'Dropdown',
      'questionType.DATE': 'Date',
      'questionType.TIME': 'Time',
      'questionType.LINEAR_SCALE': 'Linear Scale',
      
      // Question editor
      'question.title': 'Question',
      'question.titlePlaceholder': 'Enter your question',
      'question.description': 'Description (optional)',
      'question.required': 'Required',
      'question.options': 'Options',
      'question.addOption': 'Add Option',
      'question.optionPlaceholder': 'Option {{number}}',
      'question.maxLength': 'Maximum Length',
      'question.scaleMin': 'Minimum',
      'question.scaleMax': 'Maximum',
      'question.scaleStep': 'Step',
      'question.scaleLeftLabel': 'Left Label',
      'question.scaleRightLabel': 'Right Label',
      'question.save': 'Save Question',
      'question.cancel': 'Cancel',
      'question.delete': 'Delete Question',
      
      // Survey preview
      'preview.title': 'Preview',
      'preview.submit': 'Submit',
      'preview.submitting': 'Submitting...',
      
      // Results
      'results.title': 'Results',
      'results.totalResponses': 'Total Responses',
      'results.noResponses': 'No responses yet',
      'results.submissions': 'Submissions',
      'results.viewSubmission': 'View',
      'results.submittedAt': 'Submitted at',
      'results.responses': '{{count}} response(s)',
      
      // Public survey
      'public.notFound': 'Survey not found',
      'public.notAvailable': 'This survey is not available',
      'public.submit': 'Submit',
      'public.submitted': 'Thank you!',
      'public.submittedMessage': 'Your response has been submitted.',
      
      // Validation
      'validation.required': 'This field is required',
      'validation.maxLength': 'Maximum {{max}} characters allowed',
      'validation.selectOne': 'Please select an option',
      'validation.selectAtLeast': 'Please select at least one option',
      
      // Actions
      'action.save': 'Save',
      'action.cancel': 'Cancel',
      'action.delete': 'Delete',
      'action.edit': 'Edit',
      'action.create': 'Create',
      'action.back': 'Back',
      'action.confirm': 'Confirm',
      
      // Messages
      'message.saved': 'Saved successfully',
      'message.deleted': 'Deleted successfully',
      'message.error': 'An error occurred',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
