import { ReactElement } from "react"
import { Genre } from "./genres-ids"
import { 
  Crown, Eclipse, Flower, Music, TowerControl, Sword, Mountain, 
  BookOpen, Skull, Cloud, Ship, Eye, Heart, Wand, Rabbit, 
  BugPlay, Glasses, Trees, Gamepad2, Baby, Dog, Plane, Sun, Camera
} from "lucide-react"
import { FaDragon, FaGhost, FaRocket, FaChessKnight } from "react-icons/fa"

type Suggestion = {
  label: string
  prompt: string
  icon: ReactElement
  genres: Genre[]
  isChild?: boolean
}

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
  
  // Nouvelles suggestions pour adultes
  { label: "Suggestions.APO.Label", prompt: "Suggestions.APO.Prompt", 
    icon: <Skull className="h-4 w-4 text-gray-200" />,
    genres: ["post-apocalyptic", "adventure", "dystopian", "sci-fi"], 
    isChild: false
  },
  { label: "Suggestions.SOG.Label", prompt: "Suggestions.SOG.Prompt", 
    icon: <FaGhost className="h-4 w-4 text-gray-200" />,
    genres: ["horror", "mystery", "supernatural", "paranormal"], 
    isChild: false
  },
  { label: "Suggestions.VOY.Label", prompt: "Suggestions.VOY.Prompt", 
    icon: <Ship className="h-4 w-4 text-gray-200" />,
    genres: ["space-opera", "sci-fi", "adventure", "action"], 
    isChild: false
  },
  { label: "Suggestions.NEO.Label", prompt: "Suggestions.NEO.Prompt", 
    icon: <Eye className="h-4 w-4 text-gray-200" />,
    genres: ["cyberpunk", "sci-fi", "dystopian", "thriller"], 
    isChild: false
  },
  { label: "Suggestions.CLK.Label", prompt: "Suggestions.CLK.Prompt", 
    icon: <Sword className="h-4 w-4 text-gray-200" />,
    genres: ["mystery", "historical", "thriller", "adventure"], 
    isChild: false
  },
  { label: "Suggestions.EXP.Label", prompt: "Suggestions.EXP.Prompt", 
    icon: <Mountain className="h-4 w-4 text-gray-200" />,
    genres: ["adventure", "mystery", "fantasy", "thriller"], 
    isChild: false
  },
  { label: "Suggestions.ROM.Label", prompt: "Suggestions.ROM.Prompt", 
    icon: <Heart className="h-4 w-4 text-gray-200" />,
    genres: ["romance", "drama", "fantasy", "slice-of-life"], 
    isChild: false
  },
  { label: "Suggestions.STM.Label", prompt: "Suggestions.STM.Prompt", 
    icon: <Cloud className="h-4 w-4 text-gray-200" />,
    genres: ["steampunk", "adventure", "fantasy", "action"], 
    isChild: false
  },
  { label: "Suggestions.HER.Label", prompt: "Suggestions.HER.Prompt", 
    icon: <FaChessKnight className="h-4 w-4 text-gray-200" />,
    genres: ["super-heroes", "action", "adventure", "fantasy"], 
    isChild: false
  },
  { label: "Suggestions.TMT.Label", prompt: "Suggestions.TMT.Prompt", 
    icon: <FaRocket className="h-4 w-4 text-gray-200" />,
    genres: ["time-travel", "sci-fi", "adventure", "mystery"], 
    isChild: false
  },

  // Suggestions existantes pour enfants
  { label: "Suggestions.WG.Label", prompt: "Suggestions.WG.Prompt", icon: <Flower className="h-4 w-4 text-gray-200" />,
    genres: ["fantasy", "adventure", "family", "supernatural"], isChild: true
  },
  { label: "Suggestions.SL.Label", prompt: "Suggestions.SL.Prompt", icon: <TowerControl className="h-4 w-4 text-gray-200" />,
    genres: ["fantasy", "adventure", "family", "mystery"], isChild: true
  },
  { label: "Suggestions.AO.Label", prompt: "Suggestions.AO.Prompt", icon: <Music className="h-4 w-4 text-gray-200" />,
    genres: ["fantasy", "music", "adventure", "family"], isChild: true
  },
  
  // Nouvelles suggestions pour enfants
  { label: "Suggestions.FF.Label", prompt: "Suggestions.FF.Prompt", 
    icon: <Dog className="h-4 w-4 text-gray-200" />,
    genres: ["family", "adventure", "slice-of-life", "mystery"], 
    isChild: true
  },
  { label: "Suggestions.MF.Label", prompt: "Suggestions.MF.Prompt", 
    icon: <Plane className="h-4 w-4 text-gray-200" />,
    genres: ["sci-fi", "adventure", "family", "travel"], 
    isChild: true
  },
  { label: "Suggestions.SE.Label", prompt: "Suggestions.SE.Prompt", 
    icon: <Baby className="h-4 w-4 text-gray-200" />,
    genres: ["fantasy", "adventure", "family", "mystery"], 
    isChild: true
  },
  { label: "Suggestions.ED.Label", prompt: "Suggestions.ED.Prompt", 
    icon: <BookOpen className="h-4 w-4 text-gray-200" />,
    genres: ["mystery", "adventure", "family", "slice-of-life"], 
    isChild: true
  },
  { label: "Suggestions.DI.Label", prompt: "Suggestions.DI.Prompt", 
    icon: <Camera className="h-4 w-4 text-gray-200" />,
    genres: ["adventure", "mystery", "family", "fantasy"], 
    isChild: true
  },
  { label: "Suggestions.MM.Label", prompt: "Suggestions.MM.Prompt", 
    icon: <Wand className="h-4 w-4 text-gray-200" />,
    genres: ["fantasy", "adventure", "family", "mystery"], 
    isChild: true
  },
  { label: "Suggestions.JS.Label", prompt: "Suggestions.JS.Prompt", 
    icon: <Sun className="h-4 w-4 text-gray-200" />,
    genres: ["fantasy", "adventure", "family", "mythology"], 
    isChild: true
  },
  { label: "Suggestions.IB.Label", prompt: "Suggestions.IB.Prompt", 
    icon: <BugPlay className="h-4 w-4 text-gray-200" />,
    genres: ["adventure", "mystery", "family", "slice-of-life"], 
    isChild: true
  },
  { label: "Suggestions.TT.Label", prompt: "Suggestions.TT.Prompt", 
    icon: <Trees className="h-4 w-4 text-gray-200" />,
    genres: ["fantasy", "adventure", "family", "supernatural"], 
    isChild: true
  },
  { label: "Suggestions.VG.Label", prompt: "Suggestions.VG.Prompt", 
    icon: <Gamepad2 className="h-4 w-4 text-gray-200" />,
    genres: ["fantasy", "adventure", "family", "mystery"], 
    isChild: true
  },
]

export const getRandomSuggestion = (child: boolean, count: number) => {
  const filteredSuggestions = suggestions.filter(suggestion => suggestion.isChild === child)
  const shuffledSuggestions = filteredSuggestions.sort(() => Math.random() - 0.5)
  return shuffledSuggestions.slice(0, count)
}