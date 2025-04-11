import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ChoiceComponent } from "@/components/story/choice";
import { DiceCube } from "@/components/story/dice";
import { Component } from "@/lib/types";

interface PreviousChoicesProps {
  choices: any[];
  selectedChoiceId: string;
  diceRoll: number;
}

const PreviousChoices: Component<PreviousChoicesProps> = ({ choices, selectedChoiceId, diceRoll }) => {
  return (
    <Card className="w-full bg-gray-100/5">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Choix précédents</CardTitle>
          <CardDescription>Choix sélectionné</CardDescription>
        </div>
        {diceRoll !== 0 && <DiceCube face={diceRoll ?? 1} size="md" displayType="dots" />}
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {choices.map((choice) => (
          <ChoiceComponent key={choice.id} choice={choice} isSelected={choice.id === selectedChoiceId} isPrevious={true} />
        ))}
      </CardContent>
    </Card>
  );
};

export default PreviousChoices;