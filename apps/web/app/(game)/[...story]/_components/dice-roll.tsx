import { Button } from "@/components/ui/button";
import { DiceCube } from "@/components/story/dice";
import type { Component } from "@/lib/types";

interface DiceRollSectionProps {
  currentFace: number;
  isRolling: boolean;
  diceRolled: boolean;
  handleRollDice: () => void;
  handleSubmitChoice: () => void;
  loading: boolean;
  selectedChoice: any;
}

const DiceRollSection: Component<DiceRollSectionProps> = ({
  currentFace, isRolling, diceRolled, handleRollDice, handleSubmitChoice, loading, selectedChoice
}) => {
  return (
    <>
      <div className="h-20 flex items-center justify-center">
        <DiceCube face={currentFace} size="md" displayType="dots" />
      </div>
      <div className="flex flex-col gap-2 w-full">
        {!diceRolled ? (
          <Button variant="outline" className="w-full col-span-2" onClick={handleRollDice} disabled={isRolling}>
            {isRolling ? "Lancer en cours..." : "Lancer le dé"}
          </Button>
        ) : (
          <Button variant="default" className="w-full bg-yellow-500 hover:bg-yellow-600" onClick={handleSubmitChoice} disabled={loading}>
            {loading ? <span className="animate-pulse">Génération en cours...</span> : "Continuer"}
          </Button>
        )}
      </div>
      {loading && selectedChoice?.loadingMessage && (
        <div className="text-sm mt-4 p-3 bg-yellow-500/10 rounded-md">
          <p className="italic">{selectedChoice?.loadingMessage}</p>
        </div>
      )}
    </>
  );
};

export default DiceRollSection;
