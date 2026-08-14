import { ArrowUpRight, ChevronRight, MapPin } from 'lucide-react'
import './HeroOrganicButtons.css'

interface HeroOrganicButtonsProps {
  onBrowseGatherings: () => void
  onFindRestaurant: () => void
}

export function HeroOrganicButtons({ onBrowseGatherings, onFindRestaurant }: HeroOrganicButtonsProps) {
  return (
    <div className="hero-organic-actions">
      <button
        type="button"
        className="organic-button organic-button--primary"
        onClick={onBrowseGatherings}
      >
        <span className="organic-accent" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>

        <svg
          className="organic-button__shape"
          viewBox="0 0 188 58"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="
              M20 3
              C11 4 6 10 5 18
              C3 26 4 38 8 45
              C12 52 19 55 29 55

              C61 56 93 55 124 56
              C143 56 160 57 171 52

              C181 47 185 39 184 28
              C184 17 181 10 174 6

              C168 2 159 3 149 3
              C121 2 95 4 69 3
              C52 2 36 2 20 3
              Z
            "
          />
        </svg>

        <span className="organic-button__content">
          <span>모임 둘러보기</span>
          <ArrowUpRight size={17} strokeWidth={1.8} />
        </span>
      </button>

      <button
        type="button"
        className="organic-button organic-button--secondary"
        onClick={onFindRestaurant}
      >
        <svg
          className="organic-button__shape"
          viewBox="0 0 170 58"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="
              M19 4
              C11 5 6 11 5 20
              C4 29 5 39 10 46
              C15 52 22 54 32 54

              C57 55 82 53 107 54
              C128 55 145 55 155 50

              C163 46 167 39 166 29
              C166 19 163 11 157 7

              C151 3 143 3 133 4
              C108 3 84 4 60 3
              C45 3 31 2 19 4
              Z
            "
          />
        </svg>

        <span className="organic-button__content organic-button__content--secondary">
          <MapPin size={17} strokeWidth={1.7} />
          <span>식당 찾기</span>
          <ChevronRight size={17} strokeWidth={1.7} />
        </span>
      </button>
    </div>
  )
}
