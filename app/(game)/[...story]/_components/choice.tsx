import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ChoiceComponent } from "@/components/story-related/choice";
import { Component } from "@/lib/types";

interface ChoiceSectionProps {
  choices: any[];
  selectedChoice: any;
  confirmChoice: boolean;
  handleSelectChoice: (choice: any) => void;
  handleCustomTextChange: (text: string) => void;
  setConfirmChoice: (confirm: boolean) => void;
}

const ChoiceSection: Component<ChoiceSectionProps> = ({
  choices, selectedChoice, confirmChoice, handleSelectChoice, handleCustomTextChange, setConfirmChoice
}) => {
  return (
    <Card className="w-full bg-gray-100/5">
      {!confirmChoice ? (
        <>
          <CardHeader>
            <CardTitle>Choisissez</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {choices.map((choice) => (
              <ChoiceComponent
                key={choice.id}
                choice={choice}
                isSelected={selectedChoice?.id === choice.id}
                onSelect={handleSelectChoice}
                onCustomTextChange={handleCustomTextChange}
              />
            ))}
            {selectedChoice && (
              <div className="flex flex-col gap-2 mt-4">
                <Button variant="navbar" className="w-full" onClick={() => setConfirmChoice(true)}>
                  Confirmer
                </Button>
              </div>
            )}
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader>
            <CardTitle>Lancer de dé</CardTitle>
            <CardDescription>Lancez le dé pour continuer.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {/* DiceRollSection will be added here */}
          </CardContent>
        </>
      )}
    </Card>
  );
};

export default ChoiceSection;