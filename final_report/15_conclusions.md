# 10. Conclusions

## 10.1 Summary of Achievements

SPAREHUBLK successfully delivers an AI-powered online marketplace tailored to the automobile spare parts market in Sri Lanka. The project addressed the core problems identified at inception: the difficulty of finding compatible parts, the absence of structured listings, the lack of intelligent search tools, and the uncertainty around fair pricing.

The platform was built using modern web technologies (React, Vite, Node.js, Express, MongoDB) and integrates Google Gemini AI to provide image-based part identification, VIN and chassis number decoding, price market intelligence, and conversational assistance. The system supports full user lifecycle management, structured product listings, advanced search and filtering, a review and rating ecosystem, a premium seller verification workflow, and comprehensive admin moderation tools.

All primary project objectives were achieved, with two notable adaptations: the shift from custom TensorFlow models to API-based AI (which improved accuracy and accelerated delivery) and the replacement of peer-to-peer messaging with an AI chatbot (which aligned better with the project's intelligent assistance focus).

## 10.2 Contribution to the Domain

The project contributes to the local automotive e-commerce landscape by demonstrating that a domain-specific marketplace with integrated AI assistance can significantly improve the spare parts trading experience compared to general-purpose platforms. Key contributions include:

- **Structured Data Model:** Enforcing vehicle compatibility fields and specification key-value pairs in listings improves search accuracy and reduces mismatched purchases.
- **Multimodal AI Assistance:** Combining visual identification, text-based decoding, and conversational support addresses the diverse ways users seek help with spare parts.
- **Trust Mechanisms:** The review system and premium seller verification provide accountability and quality signals that are absent on social media marketplaces.
- **Localised Focus:** Tailoring the platform to Sri Lankan vehicle models, chassis codes, and pricing context fills a gap left by international platforms.

## 10.3 Academic Contribution

From an academic perspective, SPAREHUBLK demonstrates the practical application of several computer science concepts:
- **Full-Stack Web Development:** Integration of frontend frameworks, REST APIs, document databases, and authentication systems.
- **AI Integration in E-Commerce:** Practical use of generative AI APIs for multimodal understanding (text and image) in a marketplace context.
- **Software Engineering Methodology:** Application of Agile incremental development to a real-world problem.
- **Human-Computer Interaction:** Design of structured data entry and intelligent assistance to reduce user cognitive load.

## 10.4 Final Remarks

The development of SPAREHUBLK was a valuable learning experience that reinforced the importance of pragmatic decision-making in software engineering. The pivot from custom machine learning to managed AI services was a key lesson in evaluating trade-offs between academic ideals and deliverable outcomes. The project demonstrates that effective solutions can be built by combining established web technologies with accessible modern AI tools, without requiring extensive specialised infrastructure.

While the current implementation is a prototype suitable for academic evaluation, the architecture and codebase provide a solid foundation for future expansion. The modular service-based structure of the frontend, the clean separation of API routes on the backend, and the document-oriented database design all support scaling the platform to production readiness.

The SPAREHUBLK project ultimately shows that when domain expertise, user-centred design, and intelligent technology are combined thoughtfully, meaningful improvements can be made to everyday problems in specialised markets.
