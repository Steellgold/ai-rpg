import { ReactElement } from "react";
import { Genre } from "./genres-ids";
import { Crown, Eclipse, Flower, Music, TowerControl } from "lucide-react";
import { FaDragon } from "react-icons/fa";

type Suggestion = {
  label: string;
  prompt: string;
  icon: ReactElement;
  genres: Genre[];
  isChild?: boolean;
};

export const suggestions: Suggestion[] = [
  { label: "Suggestions.TKOK.Label", prompt: "Suggestions.TKOK.Prompt", icon: <Crown className="h-4 w-4 text-gray-200" />,
    genres: ["fantasy-medieval", "adventure", "mythology", "fantasy"], isChild: false
  },
  { label: "Suggestions.TSC.Label", prompt: "Suggestions.TSC.Prompt", icon: <Eclipse className="h-4 w-4 text-gray-200" />,
    genres: ["dark-fantasy", "mystery", "fantasy", "supernatural"], isChild: false
  },
  { label: "Suggestions.DRA.Label", prompt: "Suggestions.DRA.Prompt", icon: <FaDragon className="h-4 w-4 text-gray-200" />,
    genres: ["fantasy", "adventure", "mythology", "fantasy-medieval"], isChild: false
  },
  // Safe-for-children suggestions
  { label: "Suggestions.WG.Label", prompt: "Suggestions.WG.Prompt", icon: <Flower className="h-4 w-4 text-gray-200" />,
    genres: ["fantasy", "adventure", "family", "supernatural"], isChild: true
  },
  { label: "Suggestions.SL.Label", prompt: "Suggestions.SL.Prompt", icon: <TowerControl className="h-4 w-4 text-gray-200" />,
    genres: ["fantasy", "adventure", "family", "mystery"], isChild: true
  },
  { label: "Suggestions.AO.Label", prompt: "Suggestions.AO.Prompt", icon: <Music className="h-4 w-4 text-gray-200" />,
    genres: ["fantasy", "music", "adventure", "family"], isChild: true
  }
];