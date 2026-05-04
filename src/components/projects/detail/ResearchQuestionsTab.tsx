import React from "react";
import Button from "../../ui/Button";
import Card from "../../ui/Card";
import type { ResearchQuestion, PICOCElement } from "../../../types/coreAndGovernance";

interface ResearchQuestionsTabProps {
  questions: ResearchQuestion[];
  picocElements: Record<string, PICOCElement[]>;
  onAddQuestion: () => void;
  onAddPICOC: (questionId: string) => void;
  isLeader?: boolean;
}

const ResearchQuestionsTab: React.FC<ResearchQuestionsTabProps> = ({
  questions,
  picocElements,
  onAddQuestion,
  onAddPICOC,
  isLeader = true,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold items-center gap-2">
          Research Questions
        </h2>
        {isLeader && <Button onClick={onAddQuestion}>Add Research Question</Button>}
      </div>
      <div className="space-y-4">
        {questions.map((question) => (
          <Card key={question.research_question_id}>
            <div className="mb-4">
              <p className="font-semibold mb-2">{question.question_text}</p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Rationale:</strong> {question.rationale}
              </p>
            </div>

            {/* PICOC Elements */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">PICOC Elements</h4>
                {isLeader && (
                  <Button
                    size="sm"
                    onClick={() => onAddPICOC(question.research_question_id)}
                  >
                    Add PICOC
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {picocElements[question.research_question_id]?.map((element) => (
                  <div key={element.picoc_id} className="text-sm bg-gray-50 p-2 rounded">
                    <span className="font-medium capitalize">{element.element_type}:</span>{" "}
                    {element.description}
                  </div>
                ))}
                {(!picocElements[question.research_question_id] ||
                  picocElements[question.research_question_id].length === 0) && (
                    <p className="text-sm text-gray-500">No PICOC elements defined</p>
                  )}
              </div>
            </div>
          </Card>
        ))}
        {questions.length === 0 && (
          <p className="text-center text-gray-500 py-8">No research questions added yet</p>
        )}
      </div>
    </div>
  );
};

export default ResearchQuestionsTab;