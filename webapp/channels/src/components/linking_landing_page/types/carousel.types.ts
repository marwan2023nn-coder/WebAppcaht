// Copyright (c) 2015-present Workspace, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export interface CardData {
    id: number;
    image: string;
    title: string;
    descriptions: string[];
}

export interface FlipCardProps {
    data: CardData;
    isActive: boolean;
}

export interface CarouselProps {
    cards: CardData[];
    initialActive?: number;
}
